# Gemini Fitness App - Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Gemini Fitness App Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# 1. Execution Policy
Write-Host "`n[1/8] Setting execution policy" -ForegroundColor Yellow
try {
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "Done" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not set execution policy" -ForegroundColor Yellow
}

# 2. Check Python
Write-Host "`n[2/8] Checking Python" -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host $pythonVersion -ForegroundColor Green
} catch {
    Write-Host "Error: Python not found" -ForegroundColor Red
    Write-Host "Install from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# 3. Upgrade pip
Write-Host "`n[3/8] Upgrading pip" -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "Done" -ForegroundColor Green

# 4. Create venv
Write-Host "`n[4/8] Creating virtual environment" -ForegroundColor Yellow
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
Write-Host "`n[5/8] Activating virtual environment" -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "Done" -ForegroundColor Green

# 6. Install packages
Write-Host "`n[6/8] Installing packages" -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt --quiet
    Write-Host "Done" -ForegroundColor Green
} else {
    Write-Host "Error: requirements.txt not found" -ForegroundColor Red
    exit 1
}

# 7. Check .env
Write-Host "`n[7/8] Checking .env file" -ForegroundColor Yellow
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
Write-Host "`n[8/8] Setting up database" -ForegroundColor Yellow
$env:FLASK_APP = "app.py"

# データベースファイルの存在確認
$dbExists = Test-Path "instance/fitness.db"

if (-not $dbExists) {
    Write-Host "Creating new database..." -ForegroundColor Cyan
    try {
        # マイグレーションを適用
        Write-Host "  Running migrations..." -ForegroundColor Cyan
        flask db upgrade
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Database schema created" -ForegroundColor Green
            
            # 初期データを投入
            Write-Host "  Loading initial data..." -ForegroundColor Cyan
            flask init-db
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Initial data loaded successfully" -ForegroundColor Green
            } else {
                Write-Host "  Error: Could not load initial data (exit code: $LASTEXITCODE)" -ForegroundColor Red
            }
        } else {
            Write-Host "  Error: Database setup failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  Error: $_" -ForegroundColor Red
        Write-Host "  Run 'flask init-db' manually to complete setup" -ForegroundColor Yellow
    }
} else {
    Write-Host "Database already exists" -ForegroundColor Green
    Write-Host "  Checking for pending migrations..." -ForegroundColor Cyan
    try {
        flask db upgrade
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Database is up to date" -ForegroundColor Green
        } else {
            Write-Host "  Warning: Migration completed with warnings (exit code: $LASTEXITCODE)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  Error: $_" -ForegroundColor Red
    }
    
    Write-Host "`n  To reset database with fresh data, run:" -ForegroundColor Cyan
    Write-Host "    flask init-db" -ForegroundColor White
}

# Complete
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nTo start the app:" -ForegroundColor Green
Write-Host "  python app.py" -ForegroundColor White
Write-Host "`nOr use the run script:" -ForegroundColor Green
Write-Host "  .\run.ps1" -ForegroundColor White
Write-Host "`nUseful commands:" -ForegroundColor Yellow
Write-Host "  flask init-db     - Reset database with initial data" -ForegroundColor White
Write-Host "  flask db migrate  - Create new migration" -ForegroundColor White
Write-Host "  flask db upgrade  - Apply migrations" -ForegroundColor White
Write-Host ""