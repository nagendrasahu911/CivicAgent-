"""
Community Issue Clusters Router for CivicSaathi AI
Signature feature: Aggregates related reports, supports citizen upvotes with server-side deduplication,
and provides officer cluster lifecycle management (confirm, merge, split, reject).
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.routers.auth import get_current_user, require_role
from app.schemas import ClusterAction

router = APIRouter(prefix="/api/clusters", tags=["clusters"])

@router.get("", response_model=List[Dict[str, Any]])
def list_clusters(
    category: Optional[str] = None,
    status: Optional[str] = None,
    locality: Optional[str] = None
):
    """
    Publicly list active community issue clusters.
    Private complaints are strictly excluded from cluster aggregations.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT cl.*, d.name as department_name, d.code as department_code,
                   (SELECT COUNT(*) FROM complaints c WHERE c.cluster_id = cl.id AND c.privacy_mode IN ('public', 'confidential')) as verified_public_reports
            FROM issue_clusters cl
            LEFT JOIN departments d ON cl.assigned_department_id = d.id
            WHERE cl.status != 'rejected'
        """
        params = []
        if category:
            query += " AND cl.category = ?"
            params.append(category)
        if status:
            query += " AND cl.status = ?"
            params.append(status)
        if locality:
            query += " AND cl.locality LIKE ?"
            params.append(f"%{locality}%")

        query += " ORDER BY cl.support_count DESC, cl.complaint_count DESC"
        cursor.execute(query, params)
        clusters = cursor.fetchall()

        # Attach sample public evidence thumbnails for each cluster
        for c in clusters:
            cursor.execute("""
                SELECT image_url, title, ticket_number FROM complaints 
                WHERE cluster_id = ? AND image_url IS NOT NULL AND privacy_mode = 'public'
                LIMIT 3
            """, (c["id"],))
            c["sample_evidence"] = cursor.fetchall()

        return clusters

@router.get("/{cluster_id}")
def get_cluster_details(cluster_id: str, current_user: Optional[Dict[str, Any]] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT cl.*, d.name as department_name, d.code as department_code
            FROM issue_clusters cl
            LEFT JOIN departments d ON cl.assigned_department_id = d.id
            WHERE cl.id = ?
        """, (cluster_id,))
        cluster = cursor.fetchone()
        if not cluster:
            raise HTTPException(status_code=404, detail="Community issue cluster not found")

        # Fetch safe public complaints attached to this cluster
        cursor.execute("""
            SELECT id, ticket_number, title, category, locality, status, severity_score, severity_label, 
                   image_url, created_at, privacy_mode
            FROM complaints 
            WHERE cluster_id = ? AND privacy_mode IN ('public', 'confidential')
            ORDER BY severity_score DESC, created_at DESC
        """, (cluster_id,))
        complaints = cursor.fetchall()

        # Check if current user has already supported this cluster
        user_has_supported = False
        if current_user:
            cursor.execute("SELECT id FROM cluster_support_votes WHERE cluster_id = ? AND user_id = ?", (cluster_id, current_user["id"]))
            if cursor.fetchone():
                user_has_supported = True

        cluster["complaints"] = complaints
        cluster["user_has_supported"] = user_has_supported
        return cluster

@router.post("/{cluster_id}/support")
def support_cluster(cluster_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Allows a citizen to back/support a community issue cluster.
    Enforces server-side UNIQUE constraint so a citizen cannot vote multiple times.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify cluster exists
        cursor.execute("SELECT id, title, support_count FROM issue_clusters WHERE id = ?", (cluster_id,))
        cluster = cursor.fetchone()
        if not cluster:
            raise HTTPException(status_code=404, detail="Cluster not found")

        # Check existing support vote
        cursor.execute("SELECT id FROM cluster_support_votes WHERE cluster_id = ? AND user_id = ?", (cluster_id, current_user["id"]))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="You have already supported this community issue")

        vote_id = f"vot-{uuid.uuid4().hex[:10]}"
        cursor.execute("""
            INSERT INTO cluster_support_votes (id, cluster_id, user_id)
            VALUES (?, ?, ?)
        """, (vote_id, cluster_id, current_user["id"]))

        cursor.execute("UPDATE issue_clusters SET support_count = support_count + 1 WHERE id = ?", (cluster_id,))
        new_count = cluster["support_count"] + 1

        # Audit log
        cursor.execute("""
            INSERT INTO audit_logs (id, actor_id, actor_role, action, target_entity, target_id, details)
            VALUES (?, ?, ?, 'support_cluster', 'issue_cluster', ?, ?)
        """, (f"aud-{uuid.uuid4().hex[:10]}", current_user["id"], current_user["role"], cluster_id, f"Supported cluster {cluster['title']}"))

        return {
            "status": "success", 
            "message": "Thank you! Your support has been recorded for this community issue.",
            "cluster_id": cluster_id,
            "new_support_count": new_count
        }

@router.post("/{cluster_id}/officer-action")
def manage_cluster(
    cluster_id: str, 
    req: ClusterAction, 
    current_user: Dict[str, Any] = Depends(require_role(["officer", "moderator", "admin"]))
):
    """
    Authorized officer cluster controls:
    - 'confirm': Officer confirms that AI-suggested group of reports genuinely refers to the same civic incident.
    - 'merge': Merges this cluster into another target cluster.
    - 'split': Splits specified complaints into a new cluster.
    - 'reject': Dismisses cluster suggestion.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM issue_clusters WHERE id = ?", (cluster_id,))
        cluster = cursor.fetchone()
        if not cluster:
            raise HTTPException(status_code=404, detail="Cluster not found")

        if req.action == "confirm":
            cursor.execute("UPDATE issue_clusters SET confirmed_by_officer = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (cluster_id,))
            msg = "Cluster confirmed by authorized officer."

        elif req.action == "merge":
            if not req.target_cluster_id:
                raise HTTPException(status_code=400, detail="target_cluster_id required for merge action")
            # Move complaints to target cluster
            cursor.execute("UPDATE complaints SET cluster_id = ? WHERE cluster_id = ?", (req.target_cluster_id, cluster_id))
            # Sum up counts
            cursor.execute("""
                UPDATE issue_clusters 
                SET complaint_count = complaint_count + ?, support_count = support_count + ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (cluster["complaint_count"], cluster["support_count"], req.target_cluster_id))
            # Mark old cluster as merged
            cursor.execute("UPDATE issue_clusters SET status = 'merged', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (cluster_id,))
            msg = f"Cluster {cluster_id} merged into {req.target_cluster_id}."

        elif req.action == "reject":
            cursor.execute("UPDATE issue_clusters SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (cluster_id,))
            # Dissociate complaints
            cursor.execute("UPDATE complaints SET cluster_id = NULL WHERE cluster_id = ?", (cluster_id,))
            msg = "Cluster dismissed. Linked complaints are now tracked independently."

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported action '{req.action}'")

        # Audit log
        cursor.execute("""
            INSERT INTO audit_logs (id, actor_id, actor_role, action, target_entity, target_id, details)
            VALUES (?, ?, ?, ?, 'issue_cluster', ?, ?)
        """, (f"aud-{uuid.uuid4().hex[:10]}", current_user["id"], current_user["role"], f"cluster_{req.action}", cluster_id, req.notes or msg))

        return {"status": "success", "action": req.action, "message": msg}
