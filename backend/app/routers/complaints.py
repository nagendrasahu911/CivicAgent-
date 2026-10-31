"""
Complaints API Router for CivicSaathi AI
Supports creation, AI analysis, duplicate detection, full lifecycle transitions, and citizen verification.
"""
import uuid
import json
import random
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.schemas import (
    AIAnalysisRequest, AIAnalysisResult, ComplaintCreate, 
    ComplaintStatusUpdate, CitizenFeedback
)
from app.routers.auth import get_current_user, require_role
from app.services.ai_analyzer import (
    detect_language, classify_complaint, calculate_severity, 
    detect_missing_info, generate_ai_summary
)
from app.services.department_router import recommend_department
from app.services.duplicate_detector import find_duplicates

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

def sanitize_for_public(complaint: Dict[str, Any], viewer_user: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Strict privacy sanitization:
    - Private complaints: NEVER shown to public unless viewer is the creator or an authorized official.
    - Confidential complaints: personal identity, phone, and raw coordinates masked in public view.
    """
    is_owner = viewer_user and (viewer_user.get("id") == complaint.get("user_id"))
    is_official = viewer_user and (viewer_user.get("role") in ["officer", "moderator", "admin"])
    
    comp_copy = dict(complaint)
    
    if not (is_owner or is_official):
        # Strip internal notes from public view
        comp_copy["internal_officer_notes"] = None
        
        # Mask complainant sensitive details
        if comp_copy.get("privacy_mode") in ["private", "confidential"]:
            comp_copy["user_name"] = "Anonymous Citizen"
            comp_copy["user_email"] = None
            comp_copy["phone"] = None
            if comp_copy.get("privacy_mode") == "confidential":
                # Generalize exact coordinates slightly for privacy
                if comp_copy.get("latitude"):
                    comp_copy["latitude"] = round(comp_copy["latitude"], 3)
                if comp_copy.get("longitude"):
                    comp_copy["longitude"] = round(comp_copy["longitude"], 3)
    return comp_copy

@router.post("/analyze", response_model=AIAnalysisResult)
def analyze_complaint(req: AIAnalysisRequest):
    """
    Live AI assistance endpoint called before citizen final submission.
    Produces suggested category, department routing, 0-100 explainable severity breakdown,
    missing information warnings, and real-time duplicate detection.
    """
    detected_lang = detect_language(req.title + " " + req.description)
    suggested_cat, cat_conf, cat_reason = classify_complaint(req.title, req.description)
    dept_rec = recommend_department(suggested_cat, req.description)
    
    severity = calculate_severity(
        req.title, req.description, req.locality or "", 
        req.has_image, req.has_audio
    )
    
    missing_warnings = detect_missing_info(
        req.title, req.description, req.locality or "", 
        req.landmark or "", req.has_image
    )
    
    summary = generate_ai_summary(req.title, req.description, suggested_cat, req.locality or "Local ward")
    
    # Check for possible duplicates against existing active database complaints
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, cl.support_count as cluster_support_count 
            FROM complaints c 
            LEFT JOIN issue_clusters cl ON c.cluster_id = cl.id 
            WHERE c.status NOT IN ('closed', 'rejected') 
            AND c.privacy_mode IN ('public', 'confidential')
            LIMIT 50
        """)
        existing_rows = cursor.fetchall()

    duplicates = find_duplicates(
        new_title=req.title,
        new_description=req.description,
        new_category=suggested_cat,
        new_locality=req.locality or "",
        new_lat=req.latitude,
        new_lon=req.longitude,
        existing_complaints=existing_rows,
        threshold=0.55
    )

    return AIAnalysisResult(
        suggested_category=suggested_cat,
        suggested_department=dept_rec["department_name"],
        suggested_department_id=dept_rec["department_id"],
        confidence=cat_conf,
        severity_score=severity["score"],
        severity_label=severity["label"],
        severity_factors=severity,
        ai_summary=summary,
        ai_explanation=f"{cat_reason} {dept_rec['explanation']}",
        missing_info_warnings=missing_warnings,
        detected_language=detected_lang,
        possible_duplicates=duplicates[:5]
    )

@router.post("", response_model=Dict[str, Any])
def create_complaint(req: ComplaintCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Creates a new civic complaint with full AI analysis, ticket generation, and timeline entry.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Run AI analysis for categorization, scoring, and routing
        detected_lang = detect_language(req.title + " " + req.description)
        cat_to_use = req.category
        if not cat_to_use or cat_to_use == "auto":
            cat_to_use, _, _ = classify_complaint(req.title, req.description)
            
        dept_rec = recommend_department(cat_to_use, req.description)
        severity = calculate_severity(
            req.title, req.description, req.locality, 
            bool(req.image_url), bool(req.audio_url)
        )
        missing_warnings = detect_missing_info(
            req.title, req.description, req.locality, 
            req.landmark or "", bool(req.image_url)
        )
        ai_summary = generate_ai_summary(req.title, req.description, cat_to_use, req.locality)

        complaint_id = f"cmp-{uuid.uuid4().hex[:10]}"
        ticket_number = f"CIVIC-{datetime.now().year}-{random.randint(10000, 99999)}"

        # 2. Check cluster association
        cluster_id = req.join_cluster_id
        if cluster_id:
            # Citizen explicitly chose to associate/support an existing cluster
            cursor.execute("UPDATE issue_clusters SET complaint_count = complaint_count + 1 WHERE id = ?", (cluster_id,))
        else:
            # Check if there is an existing cluster nearby with same category
            cursor.execute("""
                SELECT id, latitude, longitude FROM issue_clusters 
                WHERE category = ? AND locality = ? AND status = 'active'
                LIMIT 1
            """, (cat_to_use, req.locality))
            existing_cluster = cursor.fetchone()
            if existing_cluster:
                cluster_id = existing_cluster["id"]
                cursor.execute("UPDATE issue_clusters SET complaint_count = complaint_count + 1 WHERE id = ?", (cluster_id,))
            else:
                # Create a fresh cluster seed for public complaints
                if req.privacy_mode == "public":
                    cluster_id = f"cls-{uuid.uuid4().hex[:10]}"
                    cursor.execute("""
                        INSERT INTO issue_clusters (id, title, category, locality, latitude, longitude, status, support_count, complaint_count, assigned_department_id)
                        VALUES (?, ?, ?, ?, ?, ?, 'active', 1, 1, ?)
                    """, (
                        cluster_id, f"{cat_to_use} Cluster at {req.locality}", 
                        cat_to_use, req.locality, req.latitude, req.longitude, dept_rec["department_id"]
                    ))

        # 3. Insert complaint
        cursor.execute("""
            INSERT INTO complaints (
                id, ticket_number, user_id, title, description, category, original_language,
                privacy_mode, status, locality, landmark, latitude, longitude,
                selected_address, location_selection_method,
                suggested_category, suggested_department_id, assigned_department_id,
                severity_score, severity_label, severity_factors_json, ai_summary,
                ai_explanation, missing_info_json, confidence_score,
                image_url, audio_url, audio_transcript, cluster_id,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, 'submitted', ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """, (
            complaint_id, ticket_number, current_user["id"], req.title, req.description, cat_to_use, detected_lang,
            req.privacy_mode, req.locality, req.landmark, req.latitude, req.longitude,
            req.selected_address or req.locality, req.location_selection_method or "map_pin",
            cat_to_use, dept_rec["department_id"], dept_rec["department_id"],
            severity["score"], severity["label"], json.dumps(severity), ai_summary,
            dept_rec["explanation"], json.dumps(missing_warnings), 0.92,
            req.image_url, req.audio_url, req.audio_transcript, cluster_id
        ))

        # 4. Insert initial timeline entry
        timeline_id = f"tml-{uuid.uuid4().hex[:10]}"
        cursor.execute("""
            INSERT INTO complaint_timeline (
                id, complaint_id, action, old_status, new_status, actor_id, actor_name, actor_role, public_remarks
            ) VALUES (?, ?, 'status_change', NULL, 'submitted', ?, ?, ?, ?)
        """, (
            timeline_id, complaint_id, current_user["id"], current_user["name"], 
            current_user["role"], "Complaint successfully registered by citizen. Awaiting authorized officer triage."
        ))

        # 5. Create notification for user
        notif_id = f"ntf-{uuid.uuid4().hex[:10]}"
        cursor.execute("""
            INSERT INTO notifications (id, user_id, title, message, type, link)
            VALUES (?, ?, ?, ?, 'status_update', ?)
        """, (
            notif_id, current_user["id"], "Complaint Submitted", 
            f"Your report '{req.title}' has been filed as {ticket_number}.", f"/complaints/{complaint_id}"
        ))

        return {
            "status": "success",
            "complaint_id": complaint_id,
            "ticket_number": ticket_number,
            "category": cat_to_use,
            "assigned_department": dept_rec["department_name"],
            "severity_score": severity["score"],
            "severity_label": severity["label"],
            "cluster_id": cluster_id
        }

@router.get("", response_model=List[Dict[str, Any]])
def list_complaints(
    status: Optional[str] = None,
    category: Optional[str] = None,
    locality: Optional[str] = None,
    privacy: Optional[str] = None,
    my_only: bool = False,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Role-aware complaint listings. Citizens only view public reports or their own private complaints.
    Officials view departmental queues.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        query = """
            SELECT c.*, u.name as user_name, u.email as user_email, 
                   d.name as department_name, d.code as department_code,
                   o.name as officer_name,
                   cl.support_count as cluster_support_count
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN departments d ON c.assigned_department_id = d.id
            LEFT JOIN users o ON c.assigned_officer_id = o.id
            LEFT JOIN issue_clusters cl ON c.cluster_id = cl.id
            WHERE 1=1
        """
        params = []

        is_official = current_user.get("role") in ["officer", "moderator", "admin"]
        
        if my_only or (not is_official and privacy != "public"):
            # Citizen browsing their own reports
            query += " AND c.user_id = ?"
            params.append(current_user["id"])
        elif not is_official and privacy == "public":
            # Citizen browsing public explorer
            query += " AND c.privacy_mode IN ('public', 'confidential')"
        elif is_official:
            if current_user["role"] == "officer" and current_user.get("department_id"):
                query += " AND (c.assigned_department_id = ? OR c.assigned_officer_id = ?)"
                params.extend([current_user["department_id"], current_user["id"]])

        if status:
            query += " AND c.status = ?"
            params.append(status)
        if category:
            query += " AND c.category = ?"
            params.append(category)
        if locality:
            query += " AND c.locality LIKE ?"
            params.append(f"%{locality}%")

        query += " ORDER BY c.created_at DESC LIMIT 100"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        sanitized = [sanitize_for_public(r, current_user) for r in rows]
        return sanitized

@router.get("/public", response_model=List[Dict[str, Any]])
def list_public_complaints(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    locality: Optional[str] = None,
    status: Optional[str] = None
):
    """
    Publicly accessible explorer feed. Always strictly strips private reports and personal data.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT c.*, d.name as department_name, cl.support_count as cluster_support_count
            FROM complaints c
            LEFT JOIN departments d ON c.assigned_department_id = d.id
            LEFT JOIN issue_clusters cl ON c.cluster_id = cl.id
            WHERE c.privacy_mode IN ('public', 'confidential')
        """
        params = []
        if category:
            query += " AND c.category = ?"
            params.append(category)
        if priority:
            query += " AND c.severity_label = ?"
            params.append(priority)
        if locality:
            query += " AND c.locality LIKE ?"
            params.append(f"%{locality}%")
        if status:
            query += " AND c.status = ?"
            params.append(status)

        query += " ORDER BY c.severity_score DESC, c.created_at DESC LIMIT 100"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [sanitize_for_public(r, None) for r in rows]

@router.get("/{complaint_id}")
def get_complaint_details(complaint_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Fetches full complaint details along with complete chronological activity timeline.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
                   d.name as department_name, d.code as department_code,
                   o.name as officer_name,
                   cl.title as cluster_title, cl.support_count as cluster_support_count
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN departments d ON c.assigned_department_id = d.id
            LEFT JOIN users o ON c.assigned_officer_id = o.id
            LEFT JOIN issue_clusters cl ON c.cluster_id = cl.id
            WHERE c.id = ?
        """, (complaint_id,))
        complaint = cursor.fetchone()

        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        # Authorization check for private complaints
        is_owner = complaint["user_id"] == current_user["id"]
        is_official = current_user.get("role") in ["officer", "moderator", "admin"]
        if complaint["privacy_mode"] == "private" and not (is_owner or is_official):
            raise HTTPException(status_code=403, detail="You do not have permission to view this private complaint")

        # Fetch activity timeline
        cursor.execute("""
            SELECT * FROM complaint_timeline 
            WHERE complaint_id = ? 
            ORDER BY created_at ASC
        """, (complaint_id,))
        timeline = cursor.fetchall()

        # Sanitize internal remarks if viewer is ordinary citizen
        if not is_official:
            for item in timeline:
                item["internal_remarks"] = None

        sanitized_complaint = sanitize_for_public(complaint, current_user)
        sanitized_complaint["timeline"] = timeline
        return sanitized_complaint

@router.patch("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str, 
    req: ComplaintStatusUpdate, 
    current_user: Dict[str, Any] = Depends(require_role(["officer", "moderator", "admin"]))
):
    """
    Officer status transition endpoint:
    - submitted -> under_review -> accepted / rejected -> assigned -> in_progress -> resolved_pending_feedback -> closed / reopened
    - Records every status change in chronological activity timeline with actor details.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
        complaint = cursor.fetchone()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        old_status = complaint["status"]
        new_status = req.status

        update_fields = ["status = ?", "updated_at = CURRENT_TIMESTAMP"]
        params = [new_status]

        if req.rejection_reason:
            update_fields.append("rejection_reason = ?")
            params.append(req.rejection_reason)
        if req.assigned_department_id:
            update_fields.append("assigned_department_id = ?")
            params.append(req.assigned_department_id)
        if req.assigned_officer_id:
            update_fields.append("assigned_officer_id = ?")
            params.append(req.assigned_officer_id)
        if req.internal_remarks:
            update_fields.append("internal_officer_notes = ?")
            params.append(req.internal_remarks)
        if req.resolution_notes:
            update_fields.append("resolution_notes = ?")
            params.append(req.resolution_notes)
        if req.resolution_evidence_url:
            update_fields.append("resolution_evidence_url = ?")
            params.append(req.resolution_evidence_url)
        if new_status == "resolved_pending_feedback":
            update_fields.append("resolved_at = CURRENT_TIMESTAMP")

        params.append(complaint_id)
        cursor.execute(f"UPDATE complaints SET {', '.join(update_fields)} WHERE id = ?", params)

        # Record in timeline
        timeline_id = f"tml-{uuid.uuid4().hex[:10]}"
        public_note = req.public_remarks or f"Status changed from {old_status} to {new_status}."
        if new_status == "resolved_pending_feedback":
            public_note = "Field repairs completed. Issue marked resolved — awaiting citizen inspection and feedback confirmation."

        cursor.execute("""
            INSERT INTO complaint_timeline (
                id, complaint_id, action, old_status, new_status, actor_id, actor_name, actor_role, 
                public_remarks, internal_remarks, evidence_url
            ) VALUES (?, ?, 'status_change', ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            timeline_id, complaint_id, old_status, new_status, 
            current_user["id"], current_user["name"], current_user["role"],
            public_note, req.internal_remarks, req.resolution_evidence_url
        ))

        # Notify complainant
        notif_msg = f"Status for #{complaint['ticket_number']} updated to {new_status.replace('_', ' ').title()}."
        if new_status == "resolved_pending_feedback":
            notif_msg = f"Good news! #{complaint['ticket_number']} was marked resolved. Please inspect and confirm whether the issue was fixed."

        notif_id = f"ntf-{uuid.uuid4().hex[:10]}"
        cursor.execute("""
            INSERT INTO notifications (id, user_id, title, message, type, link)
            VALUES (?, ?, ?, ?, 'status_update', ?)
        """, (
            notif_id, complaint["user_id"], "Complaint Progress Update", 
            notif_msg, f"/complaints/{complaint_id}"
        ))

        return {"status": "success", "old_status": old_status, "new_status": new_status}

@router.post("/{complaint_id}/feedback")
def submit_citizen_feedback(
    complaint_id: str, 
    req: CitizenFeedback, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Citizen-verified resolution workflow:
    When an issue is marked resolved, the citizen tests the outcome and rates/verifies it.
    If not satisfied, citizen can trigger an accountable reopening with an escalation reason.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
        complaint = cursor.fetchone()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        # Owner check
        if complaint["user_id"] != current_user["id"] and current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only the reporting citizen can verify resolution")

        new_status = "closed" if req.feedback_status == "fully_resolved" else ("reopened" if req.reopen_requested else "closed")
        
        cursor.execute("""
            UPDATE complaints SET 
                citizen_rating = ?,
                citizen_feedback_status = ?,
                citizen_feedback_notes = ?,
                reopen_reason = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            req.rating, req.feedback_status, req.comments, 
            req.reopen_reason if req.reopen_requested else None, 
            new_status, complaint_id
        ))

        # Timeline recording
        timeline_id = f"tml-{uuid.uuid4().hex[:10]}"
        action_type = "reopened" if req.reopen_requested else "citizen_feedback"
        remark = f"Citizen verified: {req.feedback_status.replace('_', ' ').title()} ({req.rating}/5 stars). Notes: {req.comments or 'None'}"
        if req.reopen_requested:
            remark += f" | Reopen requested: {req.reopen_reason}"

        cursor.execute("""
            INSERT INTO complaint_timeline (
                id, complaint_id, action, old_status, new_status, actor_id, actor_name, actor_role, 
                public_remarks, evidence_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            timeline_id, complaint_id, action_type, complaint["status"], new_status,
            current_user["id"], current_user["name"], "citizen", remark, req.feedback_evidence_url
        ))

        # If reopened, notify assigned officer
        if req.reopen_requested and complaint.get("assigned_officer_id"):
            notif_id = f"ntf-{uuid.uuid4().hex[:10]}"
            cursor.execute("""
                INSERT INTO notifications (id, user_id, title, message, type, link)
                VALUES (?, ?, ?, ?, 'escalation', ?)
            """, (
                notif_id, complaint["assigned_officer_id"], "Complaint Reopened by Citizen", 
                f"Complaint #{complaint['ticket_number']} reopened: '{req.reopen_reason}'", 
                f"/complaints/{complaint_id}"
            ))

        return {
            "status": "success", 
            "complaint_status": new_status, 
            "feedback_recorded": req.feedback_status,
            "reopened": req.reopen_requested
        }
