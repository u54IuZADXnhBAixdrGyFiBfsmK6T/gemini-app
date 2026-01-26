# Gemini Fitness App - Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Gemini Fitness App Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# 1. Execution Policy
Write-Host "`n[1/7] Setting execution policy..." -ForegroundColor Yellow
try {
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "Done" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not set execution policy" -ForegroundColor Yellow
}

# 2. Check Python
Write-Host "`n[2/7] Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host $pythonVersion -ForegroundColor Green
} catch {
    Write-Host "Error: Python not found" -ForegroundColor Red
    Write-Host "Install from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# 3. Upgrade pip
Write-Host "`n[3/7] Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "Done" -ForegroundColor Green

# 4. Create venv
Write-Host "`n[4/7] Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "venv exists. Recreate? (y/N): " -NoNewline -ForegroundColor Cyan
    $recreate = Read-Host
    if ($recreate -eq "y" -or $recreate -eq "Y") {
        Remove-Item -Recurse -Force venv
        python -m venv venv
        Write-Host "Recreated" -ForegroundColor Green
    } else {
        Write-Host "Using existing venv" -ForegroundColor Green
    }
} else {
    python -m venv venv
    Write-Host "Created" -ForegroundColor Green
}

# 5. Activate venv
Write-Host "`n[5/7] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "Done" -ForegroundColor Green

# 6. Install packages
Write-Host "`n[6/7] Installing packages..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt --quiet
    Write-Host "Done" -ForegroundColor Green
} else {
    Write-Host "Error: requirements.txt not found" -ForegroundColor Red
    exit 1
}

# 7. Check .env
Write-Host "`n[7/7] Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "Found .env file" -ForegroundColor Green
} else {
    Write-Host "Warning: .env file not found" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Write-Host "Create .env from .env.example:" -ForegroundColor Cyan
        Write-Host "  Copy-Item .env.example .env" -ForegroundColor White
    }
}

# 8. Database setup
Write-Host "`n[8/8] Setting up database..." -ForegroundColor Yellow
try {
    $output = flask db upgrade 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database ready" -ForegroundColor Green
    } else {
        Write-Host "Database setup completed with warnings" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Note: Database migration skipped (normal on first run)" -ForegroundColor Yellow
}

# Complete
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nTo start the app:" -ForegroundColor Green
Write-Host "  python app.py" -ForegroundColor White
Write-Host "`nOr use the run script:" -ForegroundColor Green
Write-Host "  .\run.ps1" -ForegroundColor White
Write-Host ""