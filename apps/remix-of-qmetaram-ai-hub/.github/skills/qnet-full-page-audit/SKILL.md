---
name: qnet-full-page-audit
description: 'Run full-page availability and runtime diagnostics for Q-NET/Qmetaram. Use when pages like /chat or /q-network fail, show 404, or work inconsistently between localhost and public domain. Includes service checks (Nginx, cloudflared, Docker), route probing, React runtime root-cause analysis, safe code fixes, build verification, and operator report.'
argument-hint: Which domain/app should be audited and what is failing?
---

# Q-NET Full Page Audit

## What This Skill Produces
- A reproducible diagnosis of why specific pages fail.
- Verified fixes in app code and/or scripts.
- A health report covering local and public routes.
- A clear final status: fixed, partially fixed, or blocked by external config.

## When to Use
- User reports: "chat not working", "page does not open", "404/blank page", "works locally but not on domain".
- Infra is mixed (Nginx + cloudflared + static serve + Docker).
- Need end-to-end validation across all routes, not only one page.

## Inputs
- Active app root path (example: app with src/App.tsx and src/pages).
- Public domain (example: https://qmetaram.com).
- Local serve URL (example: http://localhost:34757).
- Optional known failing paths (example: /chat, /q-network).

## Procedure

### 1. Baseline Runtime Health
1. Run the stack status script if available (example: C:/Users/KUNIGO/status-qnet.ps1).
2. Confirm listeners for ports 80, app port(s), and Docker services.
3. Confirm processes: nginx, cloudflared, node.
4. If any critical process is down:
- Restart stack scripts first.
- Re-run baseline check before code changes.

### 2. Route Reachability Matrix
1. Probe both public and local URLs for:
- Home page
- Reported failing pages
- Auth callback/reset paths
2. Record status code and page title for each URL.
3. If status != 200 on public but local is 200:
- Treat as routing/tunnel/DNS problem.
4. If both are 200 but user still reports failure:
- Treat as client runtime error (React crash, JS exception, auth gating, API failure).

### 3. Source-Level Root Cause
1. Read src/App.tsx routes and map each failing path to page component.
2. Open the target page file(s).
3. Check common crash causes:
- Missing imports for used JSX symbols.
- Unhandled null/undefined access.
- Invalid hook usage.
- API calls requiring auth/session with hard-fail behavior.
4. For chat-like pages, inspect request path selection (external API vs Supabase function), headers, token usage, and fallback behavior.

### 4. Decision Branches
- If route missing in router:
Add explicit route and reuse correct page wrapper.

- If route exists but page crashes:
Patch component runtime errors (imports, guards, null checks).

- If feature fails only for guest users:
Allow guest mode where safe; degrade gracefully (no persistence) instead of hard redirect.

- If OAuth/auth callback 404:
Add callback/reset routes and recovery-mode detection in auth page.

- If stop/start scripts fail in PowerShell:
Fix parser-safe variable interpolation (use ${var} before colon) and re-parse script.

### 5. Validate Fixes
1. Run TypeScript/Problems check for changed files.
2. Run build (npm run build) and confirm success.
3. Re-probe all key routes on local and public URLs.
4. Verify user-reported failing pages now return expected content.

### 6. Completion Criteria
Mark complete only if all are true:
- Reported broken pages are reachable and render.
- No new compile errors in changed files.
- Build succeeds.
- Runtime health script shows core services running.
- Final report includes root cause + exact files changed + remaining external blockers.

## Reporting Template
- Issue summary:
- Root cause:
- Fixes applied:
- Validation evidence:
- Remaining risks/blockers:
- Next actions:

## Guardrails
- Do not run destructive git commands.
- Do not revert unrelated workspace changes.
- Keep patches minimal and targeted.
- Distinguish clearly between app-code issues and infrastructure/provider issues.
