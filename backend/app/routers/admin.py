"""
Admin & System Management Router for CivicSaathi AI
Supports audit logging, SLA escalation rules, speech transcription gateway, and Reset Demo Data.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Dict, Any, List, Optional
from app.database import get_db, init_db
from app.routers.auth import require_role, get_current_user
from app.services.speech_service import transcribe_audio_payload, DEMO_SPEECH_SAMPLES

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/audit-logs")
def get_audit_logs(current_user: Dict[str, Any] = Depends(require_role(["moderator", "admin"]))):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100")
        return cursor.fetchall()

@router.get("/speech/samples")
def get_speech_samples():
    """Provides sample Hindi and English presets for speech-to-text evaluation."""
    return DEMO_SPEECH_SAMPLES

@router.post("/speech/transcribe")
def transcribe_speech(payload: Dict[str, Any] = Body(...)):
    preset_key = payload.get("preset_key")
    language_hint = payload.get("language_hint", "hi")
    audio_base64 = payload.get("audio_base64")
    return transcribe_audio_payload(audio_base64, language_hint, preset_key)

@router.post("/reset-demo")
def reset_demo_database(current_user: Optional[Dict[str, Any]] = Depends(get_current_user)):
    """
    Safely resets database and repopulates rich realistic demo dataset for hackathon / demonstration.
    """
    from app.seed_data import seed_database
    # Reset tables
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS audit_logs;")
        cursor.execute("DROP TABLE IF EXISTS notifications;")
        cursor.execute("DROP TABLE IF EXISTS cluster_support_votes;")
        cursor.execute("DROP TABLE IF EXISTS complaint_timeline;")
        cursor.execute("DROP TABLE IF EXISTS complaints;")
        cursor.execute("DROP TABLE IF EXISTS issue_clusters;")
        cursor.execute("DROP TABLE IF EXISTS departments;")
        cursor.execute("DROP TABLE IF EXISTS users;")
    
    init_db()
    seed_database()
    return {"status": "success", "message": "CivicSaathi AI demo data successfully restored to factory baseline."}
