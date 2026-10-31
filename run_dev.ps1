Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Launching CivicSaathi AI (Full Stack Civic Platform)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Start Backend
Write-Host "Starting Python FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process python -ArgumentList "backend/run.py"

# Start Frontend
Write-Host "Starting Vite React Frontend on http://localhost:5173 ..." -ForegroundColor Green
Set-Location frontend
npm run dev
