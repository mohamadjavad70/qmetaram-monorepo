$scriptPath = "C:\Users\KUNIGO\status-qnet.ps1"

if (-not (Test-Path $scriptPath)) {
	Write-Error "Missing root script: $scriptPath"
	exit 1
}

& $scriptPath