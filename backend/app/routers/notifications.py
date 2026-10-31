"""
Notifications Router for CivicSaathi AI
In-app notifications for status updates, officer review requests, and citizen resolution feedback.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("", response_model=List[Dict[str, Any]])
def get_user_notifications(current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 30
        """, (current_user["id"],))
        return cursor.fetchall()

@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notification_id, current_user["id"]))
        return {"status": "success"}

@router.post("/read-all")
def mark_all_read(current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (current_user["id"],))
        return {"status": "success"}
