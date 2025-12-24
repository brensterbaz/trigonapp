# Clear caches
Write-Host "Clearing .next cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "✓ .next cleared" -ForegroundColor Green
}

Write-Host "Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
    Write-Host "✓ node_modules\.cache cleared" -ForegroundColor Green
}

Write-Host "`nRunning build..." -ForegroundColor Cyan
npm run build
