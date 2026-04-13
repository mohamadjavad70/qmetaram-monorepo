#!/usr/bin/env bash
set -euo pipefail

PROJECT_PATH="/mnt/c/Users/KUNIGO/Downloads/sale 1404/Q-Network-Core/qmetaram-monorepo/apps/remix-of-qmetaram-ai-hub"
PORT="${QNET_PORT:-34757}"
TUNNEL_NAME="${QNET_TUNNEL_NAME:-qnet-tunnel}"
MAIN_BRANCH="${QNET_MAIN_BRANCH:-main}"
ORIGIN_LOG="${QNET_ORIGIN_LOG:-qnet-origin.log}"
TUNNEL_LOG="${QNET_TUNNEL_LOG:-qnet-tunnel.log}"
STATUS_REPORT="${QNET_STATUS_REPORT:-qnet-status.txt}"
FORCE_BUILD="${QNET_FORCE_BUILD:-0}"
SKIP_PULL="${QNET_SKIP_PULL:-0}"

INSTALL_ACTION="skipped"
BUILD_ACTION="skipped"
HTTP_STATUS="000"
TUNNEL_STATUS="unknown"

log() {
  printf '[QNET] %s\n' "$1"
}

write_status_report() {
  cat > "$STATUS_REPORT" <<EOF
timestamp=$(date -Iseconds)
project_path=$PROJECT_PATH
repo_root=$REPO_ROOT
branch=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)
old_commit=$OLD_COMMIT
new_commit=$NEW_COMMIT
port=$PORT
local_url=http://127.0.0.1:$PORT/
http_status=$HTTP_STATUS
tunnel_name=$TUNNEL_NAME
tunnel_status=$TUNNEL_STATUS
install_action=$INSTALL_ACTION
build_action=$BUILD_ACTION
origin_log=$ORIGIN_LOG
tunnel_log=$TUNNEL_LOG
status_report=$STATUS_REPORT
EOF
}

trap write_status_report EXIT

retry_npm_install_once() {
  local install_log
  install_log="$(mktemp)"

  if npm install >"$install_log" 2>&1; then
    cat "$install_log"
    rm -f "$install_log"
    return 0
  fi

  cat "$install_log"

  if grep -q 'ENOENT' "$install_log" && printf '%s' "$PROJECT_PATH" | grep -q '^/mnt/'; then
    log "npm install hit ENOENT on /mnt/*; retrying once after removing node_modules"
    rm -rf node_modules
    if npm install; then
      rm -f "$install_log"
      return 0
    fi
  fi

  rm -f "$install_log"
  return 1
}

if ! git -C "$PROJECT_PATH" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  log "ERROR: project path is not inside a git work tree"
  exit 1
fi

REPO_ROOT="$(git -C "$PROJECT_PATH" rev-parse --show-toplevel)"
cd "$PROJECT_PATH"

OLD_COMMIT="$(git -C "$REPO_ROOT" rev-parse HEAD)"
NEW_COMMIT="$OLD_COMMIT"

if [ "$SKIP_PULL" = "1" ]; then
  log "Skipping git pull (QNET_SKIP_PULL=1)"
else
  log "Pulling latest from origin/$MAIN_BRANCH"
  if ! git -C "$REPO_ROOT" pull --ff-only origin "$MAIN_BRANCH"; then
    log "Pull failed (non-fast-forward or local changes). Continuing with local HEAD."
  fi
  NEW_COMMIT="$(git -C "$REPO_ROOT" rev-parse HEAD)"
fi

CHANGED_FILES=""
if [ "$OLD_COMMIT" != "$NEW_COMMIT" ]; then
  CHANGED_FILES="$(git -C "$REPO_ROOT" diff --name-only "$OLD_COMMIT" "$NEW_COMMIT" || true)"
fi

NEEDS_INSTALL=0
if [ "$FORCE_BUILD" = "1" ]; then
  NEEDS_INSTALL=1
elif [ ! -d node_modules ]; then
  NEEDS_INSTALL=1
elif [ -n "$CHANGED_FILES" ] && printf '%s\n' "$CHANGED_FILES" | grep -Eq '(^|/)package.json$|(^|/)package-lock.json$'; then
  NEEDS_INSTALL=1
fi

if [ "$NEEDS_INSTALL" -eq 1 ]; then
  log "Running npm install"
  INSTALL_ACTION="ran"
  retry_npm_install_once
else
  log "Skipping npm install (dependencies unchanged)"
fi

NEEDS_BUILD=0
if [ "$FORCE_BUILD" = "1" ]; then
  NEEDS_BUILD=1
elif [ ! -d dist ]; then
  NEEDS_BUILD=1
elif [ "$OLD_COMMIT" != "$NEW_COMMIT" ]; then
  NEEDS_BUILD=1
fi

if [ "$NEEDS_BUILD" -eq 1 ]; then
  log "Running npm run build"
  BUILD_ACTION="ran"
  npm run build
else
  log "Skipping build (no code changes and dist exists)"
fi

log "Stopping server on port $PORT (if running)"
fuser -k "$PORT"/tcp >/dev/null 2>&1 || true
sleep 1

log "Starting static server"
setsid nohup npx serve -s dist -l "$PORT" --single > "$ORIGIN_LOG" 2>&1 < /dev/null &

for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
    log "Health check passed: http://127.0.0.1:$PORT/"
    break
  fi
  sleep 2
done

if ! curl -fsS "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
  HTTP_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || printf '000')"
  log "ERROR: health check failed after restart"
  if [ -f "$ORIGIN_LOG" ]; then
    log "---origin log---"
    cat "$ORIGIN_LOG"
  fi
  exit 1
fi

HTTP_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || printf '000')"

if command -v cloudflared >/dev/null 2>&1; then
  if pgrep -f "cloudflared.*$TUNNEL_NAME" >/dev/null 2>&1; then
    log "Tunnel already running: $TUNNEL_NAME"
    TUNNEL_STATUS="running"
  else
    log "Starting tunnel: $TUNNEL_NAME"
    setsid nohup cloudflared tunnel run "$TUNNEL_NAME" > "$TUNNEL_LOG" 2>&1 < /dev/null &
    TUNNEL_STATUS="started"
  fi
else
  log "cloudflared not found in PATH, tunnel start skipped"
  TUNNEL_STATUS="missing-binary"
fi

log "DONE"
log "URL: https://qmetaram.com"
log "Local: http://127.0.0.1:$PORT/"
log "HTTP status: $HTTP_STATUS"
log "Status report: $STATUS_REPORT"
log "Origin log: $ORIGIN_LOG"
log "Tunnel log: $TUNNEL_LOG"
