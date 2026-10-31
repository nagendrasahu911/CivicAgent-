"""
CivicSaathi AI - Backend Configuration
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

DB_PATH = DATA_DIR / "civicsaathi.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

JWT_SECRET = os.getenv("CIVICSAATHI_JWT_SECRET", "civicsaathi-ai-super-secret-key-2026-hackathon")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24  # 24 hours

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
