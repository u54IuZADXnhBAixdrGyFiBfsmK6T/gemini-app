# Gemini Fitness App - Run Script
Write-Host "Starting Gemini Fitness App..." -ForegroundColor Cyan

if (-not (Test-Path "venv")) {
    Write-Host "Error: venv not found. Run setup.ps1 first" -ForegroundColor Red
    exit 1
}

& .\venv\Scripts\Activate.ps1
Write-Host "Server starting at http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
python app.py