"""
CivicSaathi AI - Backend Configuration
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Check if running in a serverless environment like Vercel or AWS Lambda
IS_SERVERLESS = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))

if IS_SERVERLESS:
    DATA_DIR = Path("/tmp/data")
    DATA_DIR.mkdir(exist_ok=True, parents=True)
    UPLOADS_DIR = Path("/tmp/uploads")
    UPLOADS_DIR.mkdir(exist_ok=True, parents=True)
    DB_PATH = DATA_DIR / "civicsaathi.db"
    
    # Copy pre-seeded SQLite database to writable /tmp directory if not present
    SRC_DB = BASE_DIR / "data" / "civicsaathi.db"
    if not DB_PATH.exists() and SRC_DB.exists():
        import shutil
        shutil.copy2(SRC_DB, DB_PATH)
else:
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
