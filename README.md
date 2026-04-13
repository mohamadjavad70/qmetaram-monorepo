# Qmetaram Monorepo

Unified workspace for active Q-Network repositories.

## Active Apps

- apps/samir-ai-exchange
- apps/remix-of-qmetaram-ai-hub
- apps/qmetaram.ai
- apps/jupiter-agent

## Quick Start

1. Ingest active repositories into apps:

```powershell
./scripts/ingest-active-repos.ps1
```

2. Install workspace dependencies:

```powershell
pnpm install
```

3. Run development tasks:

```powershell
pnpm dev
```

4. Run quality gates:

```powershell
pnpm lint
pnpm test
pnpm build
```

## Q-NET Light Nodes

Generate HTML light nodes from this workspace:

PowerShell (Windows):

```powershell
./scripts/qnet-light-node.ps1
```

ash/sh (Linux/Alpine):

```sh
chmod +x ./scripts/qnet-light-node.sh
./scripts/qnet-light-node.sh
```

## Ollama Q Model

Local helper for `mshznet77/Q`:

```powershell
ollama pull mshznet77/Q
./scripts/ollama-q-chat.ps1 -Prompt "Hello!"
```

Reference:

- docs/ai/ollama-q-model.md
