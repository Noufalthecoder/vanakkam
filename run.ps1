Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "                     LEMON MAJA APPLICATION RUNNER" -ForegroundColor Yellow
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Clean up any stale Next.js dev locks
if (Test-Path ".next\dev\lock") {
    Remove-Item -Path ".next\dev\lock" -Force -ErrorAction SilentlyContinue
}

# 1. Check Node
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
    exit 1
}

Write-Host "[1/3] Node.js found: $(node --version)" -ForegroundColor Green
Write-Host ""

# 2. Check dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "[2/3] First-time setup: Installing dependencies..." -ForegroundColor Yellow
    pnpm install
} else {
    Write-Host "[2/3] Dependencies verified: node_modules present." -ForegroundColor Green
}
Write-Host ""

# 3. Launch
Write-Host "[3/3] Starting development server..." -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Application URL : http://localhost:3000" -ForegroundColor Yellow
Write-Host "  To Stop Server  : Press Ctrl + C" -ForegroundColor Gray
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Start-Process "http://localhost:3000"

pnpm dev
