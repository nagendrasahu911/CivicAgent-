"""
Departments & Officer Rosters Router for CivicSaathi AI
"""
from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/departments", tags=["departments"])

@router.get("", response_model=List[Dict[str, Any]])
def list_departments():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT d.*, 
                   COUNT(c.id) as total_complaints,
                   SUM(CASE WHEN c.status = 'in_progress' THEN 1 ELSE 0 END) as active_work_count
            FROM departments d
            LEFT JOIN complaints c ON d.id = c.assigned_department_id
            GROUP BY d.id
            ORDER BY d.name ASC
        """)
        return cursor.fetchall()

@router.get("/officers", response_model=List[Dict[str, Any]])
def list_officers(current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.name, u.email, u.role, u.department_id, d.name as department_name,
                   (SELECT COUNT(*) FROM complaints c WHERE c.assigned_officer_id = u.id AND c.status != 'closed') as active_assignments
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.role IN ('officer', 'moderator')
            ORDER BY u.name ASC
        """)
        return cursor.fetchall()
