# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Chat setup

The chat pages in this app require a valid Supabase project URL, a valid publishable key, and deployed Edge Functions.

1. Copy `.env.example` to `.env` if needed.
2. Set `VITE_SUPABASE_URL` to `https://znugdnkcmwuvfnmdmupn.supabase.co`.
3. Set `VITE_SUPABASE_PUBLISHABLE_KEY` to the real publishable or anon key for project `znugdnkcmwuvfnmdmupn`.
4. Run `npm run check:supabase` to verify the local configuration.
5. Run `npm run deploy:chat-functions` to deploy `ai-chat` and `multi-model-orchestration`.

`npm run check:supabase` validates that the URL points to the configured project and warns if the key is missing, still a placeholder, or clearly belongs to a different Supabase project.

`npm run deploy:chat-functions` requires a Supabase CLI session or access token with deploy privileges for project `znugdnkcmwuvfnmdmupn`.

## Q-Agent setup

Q-Agent adds a frontend control surface at `/q-agent`, a Cloudflare Worker orchestrator, and a Supabase-backed `iot_commands` queue.

1. Apply the migration in `supabase/migrations/20260411183000_add_iot_commands.sql`.
2. Set `VITE_Q_AGENT_WORKER_URL` in `.env` for the frontend.
3. Configure the Worker secrets in Cloudflare:
	- `SUPABASE_URL`
	- `SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `BANK_API_URL`
	- `BANK_TOKEN`
4. Run `npm run dev:q-agent-worker` for local Worker development.
5. Run `npm run deploy:q-agent-worker` to publish the Worker.

## Q-NET local control scripts

The local Q-NET stack can be managed from either the user root or the project wrappers.

Root scripts:

- `C:\Users\KUNIGO\start-qnet.ps1`
- `C:\Users\KUNIGO\stop-qnet.ps1`
- `C:\Users\KUNIGO\status-qnet.ps1`
- `C:\Users\KUNIGO\check-encoding.ps1`

Project wrappers:

- `./scripts/start-qnet.ps1`
- `./scripts/stop-qnet.ps1`
- `./scripts/status-qnet.ps1`
- `./scripts/check-encoding.ps1`

Typical usage from the project directory:

```powershell
.\scripts\start-qnet.ps1
.\scripts\status-qnet.ps1
.\scripts\stop-qnet.ps1
.\scripts\check-encoding.ps1
```

What these scripts do:

- `start-qnet.ps1`: starts Docker services, local `serve` processes, Nginx, and the Cloudflare tunnel.
- `stop-qnet.ps1`: stops Nginx, the Cloudflare tunnel, the local `serve` processes, and Docker services.
- `status-qnet.ps1`: reports port status, Nginx status, Cloudflare tunnel status, local `.q` domains, public domains, and recent Nginx logs.
- `check-encoding.ps1`: verifies that Nginx config files are UTF-8 without BOM.

## Q-NET smart deploy on WSL

For the React app in this folder, the recommended WSL deployment path is the smart deploy script exposed as `npm run qnet:smart-deploy`.

What it does:

- Pulls `origin/main` with `--ff-only` unless `QNET_SKIP_PULL=1` is set.
- Runs `npm install` only when `node_modules` is missing, dependencies changed, or `QNET_FORCE_BUILD=1` is set.
- Runs `npm run build` only when `dist` is missing, commits changed, or `QNET_FORCE_BUILD=1` is set.
- Restarts the static origin on port `34757`.
- Verifies origin health with an internal `curl` check.
- Starts `qnet-tunnel` only when it is not already running.
- Writes a centralized status report to `qnet-status.txt`.

Useful commands:

```bash
npm run qnet:smart-deploy
npm run qnet:smart-status
npm run qnet:smart-alert
cat qnet-origin.log
cat qnet-tunnel.log
```

Supported environment variables:

- `QNET_PORT`: override the origin port. Default: `34757`.
- `QNET_TUNNEL_NAME`: override the Cloudflare tunnel name. Default: `qnet-tunnel`.
- `QNET_MAIN_BRANCH`: branch used for pull. Default: `main`.
- `QNET_ORIGIN_LOG`: origin log path. Default: `qnet-origin.log`.
- `QNET_TUNNEL_LOG`: tunnel log path. Default: `qnet-tunnel.log`.
- `QNET_STATUS_REPORT`: centralized status file path. Default: `qnet-status.txt`.
- `QNET_SKIP_PULL=1`: skip `git pull` and deploy current local code.
- `QNET_FORCE_BUILD=1`: force `npm install` and `npm run build`.

Lightweight alerting:

- `npm run qnet:smart-alert` reads `qnet-status.txt` and exits with code `1` if `http_status` is not `200` or `tunnel_status` is not `running`.
- Alerts are appended to `qnet-alert.log`.
- Set `QNET_ALERT_WEBHOOK_URL` to send the same alert payload to a webhook endpoint.
- Optional overrides:
	- `QNET_EXPECT_HTTP` default: `200`
	- `QNET_EXPECT_TUNNEL` default: `running`
	- `QNET_ALERT_LOG` default: `qnet-alert.log`

Example scheduler-style usage from WSL:

```bash
cd /mnt/c/Users/KUNIGO/Downloads/sale\ 1404/Q-Network-Core/qmetaram-monorepo/apps/remix-of-qmetaram-ai-hub
npm run qnet:smart-alert
```

WSL note about the earlier `ENOENT` install failure:

- The failure pattern is consistent with running Node/npm inside WSL while the project lives on `/mnt/c/...`, where interrupted cleanup of `node_modules` can leave the tree in a partially removed state.
- The smart deploy script now retries `npm install` once after deleting `node_modules` if it sees `ENOENT` in a `/mnt/*` path.
- For maximum stability, keep using one runtime consistently and avoid mixing Windows npm and WSL npm on the same `node_modules` tree.

The centralized status file includes the current branch, commit range, HTTP status, tunnel status, and the install/build actions that were taken during the last deploy.

## Nginx BOM note

This setup previously failed because Windows PowerShell wrote Nginx config files with a UTF-8 BOM. Nginx then interpreted the first directive as `ï»¿worker_processes` and rejected the file.

To avoid this, the control scripts write Nginx config files with `.NET` file APIs and `UTF8Encoding($false)` instead of `Out-File -Encoding utf8`.

## Public domain note

If local `.q` domains work but `https://qmetaram.com` or `https://www.qmetaram.com` fail with Cloudflare errors such as `1016` or `1033`, the local stack is usually healthy and the issue is on the Cloudflare side: DNS records, public hostname mapping, or tunnel routing.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
