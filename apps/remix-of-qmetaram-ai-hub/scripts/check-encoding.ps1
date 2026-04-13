$scriptPath = "C:\Users\KUNIGO\check-encoding.ps1"

if (-not (Test-Path $scriptPath)) {
	Write-Error "Missing root script: $scriptPath"
	exit 1
}

& $scriptPath