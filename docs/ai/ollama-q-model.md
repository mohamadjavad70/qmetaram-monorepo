# Ollama Model: mshznet77/Q

## Current Local Status
- Ollama installed: yes
- Local API reachable on `http://localhost:11434`
- Loaded models at scan time: none

## Quick Start

### Pull remote model
```powershell
ollama pull mshznet77/Q
```

### Test via API
```powershell
./scripts/ollama-q-chat.ps1 -Model "mshznet77/Q" -Prompt "Hello!"
```

### Raw curl example
```bash
curl http://localhost:11434/api/chat \
  -d '{
    "model": "mshznet77/Q",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Create and Push Flow
```powershell
ollama pull llama3.2
@"
FROM llama3.2
SYSTEM You are a friendly assistant.
"@ | Set-Content Modelfile
ollama create mshznet77/Q -f Modelfile
ollama push mshznet77/Q
```

## Alternative: copy existing model
```powershell
ollama cp llama3.2 mshznet77/Q
ollama push mshznet77/Q
```

## Operational Notes
- If `api/tags` returns an empty model list, you need to `pull` or `create` the model before chat requests will succeed.
- Keep Ollama listening on the default port unless your app config explicitly overrides it.
- For workspace integration, prefer calling the local HTTP API instead of shelling out from app code.
