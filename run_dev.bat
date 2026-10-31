@echo off
echo ========================================================
echo Launching CivicSaathi AI (Full Stack Civic Platform)
echo ========================================================

echo Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "CivicSaathi AI Backend" cmd /k "python backend/run.py"

echo Starting Vite React Frontend on http://localhost:5173 ...
cd frontend
npm run dev
