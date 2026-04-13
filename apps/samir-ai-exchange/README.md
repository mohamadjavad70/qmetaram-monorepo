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

## Deploy to samir.com (Hostinger)

1) Build  
```bash
npm install
npm run build
```
The production assets are generated in `dist/`.

2) Upload to Hostinger  
- If using a static plan: upload the `dist/` contents to `public_html` (or your site root).  
- If using a Node plan: serve `dist/` with your preferred HTTP server (e.g., `npm install -g serve` then `serve dist -p 4173`).

3) DNS records (Hostinger)  
- Nameservers: `ns1.dns-parking.com`, `ns2.dns-parking.com` (already shown in the panel).  
- A records (example from provided panel):  
  - `@` → `185.158.133.1` (TTL 300)  
  - `www` → `185.158.133.1` (TTL 300)  
Wait for propagation (15 minutes to 24 hours). After that, `samir.com` and `www.samir.com` should serve the app you uploaded in step 2.

4) Environment variables (production)  
Set these in your hosting panel or build pipeline before running `npm run build`:

| Key | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID (web3 connect) |
| `VITE_QMETARAM_API_URL` | Backend URL for QMetaRam FastAPI (e.g., `https://api.samir.com`) |
| `LOVABLE_API_KEY` | Required by Supabase edge function `samir-chat` to reach Lovable AI gateway |

5) Health checks  
- `npm run build` must succeed locally.  
- `npm test` should pass.  
- If you deploy Supabase Edge Functions, ensure `LOVABLE_API_KEY` is set in the Supabase project settings.

## Can I connect another custom domain?

Yes. In Lovable: Project > Settings > Domains > Connect Domain. Follow the DNS steps for your registrar.
