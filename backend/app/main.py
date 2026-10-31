"""
CivicSaathi AI - Main FastAPI Application Entrypoint
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import CORS_ORIGINS, UPLOADS_DIR
from app.database import init_db
from app.seed_data import seed_database
from app.routers import auth, complaints, clusters, analytics, notifications, departments, admin

app = FastAPI(
    title="CivicSaathi AI API",
    description="Intelligent civic engagement, duplicate detection, community clustering, and citizen-verified complaint platform.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Include API routers
app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(clusters.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(departments.router)
app.include_router(admin.router)

@app.on_event("startup")
def on_startup():
    init_db()
    seed_database()

@app.get("/")
def root():
    return {
        "platform": "CivicSaathi AI",
        "tagline": "Your Voice. Smarter Action. Accountable Communities.",
        "status": "operational",
        "version": "1.0.0",
        "api_docs": "/docs",
        "disclaimer": "CivicSaathi AI is an independent civic-technology demonstration platform. Not affiliated with or endorsed by any specific municipal government."
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_ready",
        "ai_engine": "multilingual_nlp_active",
        "duplicate_detection": "tfidf_semantic_active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
