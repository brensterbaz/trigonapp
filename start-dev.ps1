# Development Server Startup Script
Write-Host "=== Starting NRM2 Tender App ===" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dependencies not installed!" -ForegroundColor Yellow
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

# Check for .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local file not found!" -ForegroundColor Yellow
    Write-Host "The app requires Supabase environment variables." -ForegroundColor Yellow
    Write-Host "See QUICK_START.md for setup instructions." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting server anyway (may fail if env vars are missing)..." -ForegroundColor Yellow
    Write-Host ""
}

# Kill any existing node processes on port 3000
$existing = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "⚠️  Port 3000 is already in use!" -ForegroundColor Yellow
    $processId = $existing.OwningProcess
    Write-Host "Killing process $processId..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Check if build was requested
if ($args -contains "--build" -or $args -contains "-b") {
    Write-Host "🔨 Building production bundle..." -ForegroundColor Green
    Write-Host ""
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Build completed successfully!" -ForegroundColor Green
        Write-Host "Run 'npm start' to start the production server" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Build failed! Check the errors above." -ForegroundColor Red
        exit 1
    }
} else {
    # Start the dev server
    npm run dev
}

