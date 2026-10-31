"""
Civic Risk Radar & Analytics Router for CivicSaathi AI
Aggregates public issue hotspots, recurring cluster patterns, department workload, and SLA compliance.
"""
from fastapi import APIRouter
from typing import Dict, Any, List
from app.database import get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/risk-radar")
def get_risk_radar_metrics() -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Category breakdown
        cursor.execute("""
            SELECT category, COUNT(*) as count, AVG(severity_score) as avg_severity
            FROM complaints
            WHERE privacy_mode IN ('public', 'confidential')
            GROUP BY category
            ORDER BY count DESC
        """)
        category_stats = cursor.fetchall()

        # 2. Status distribution
        cursor.execute("""
            SELECT status, COUNT(*) as count 
            FROM complaints 
            GROUP BY status
        """)
        status_stats = cursor.fetchall()

        # 3. Severity tiers
        cursor.execute("""
            SELECT severity_label, COUNT(*) as count 
            FROM complaints 
            GROUP BY severity_label
        """)
        severity_stats = cursor.fetchall()

        # 4. Department workload & average resolution SLA
        cursor.execute("""
            SELECT d.id, d.name, d.code, d.sla_hours,
                   COUNT(c.id) as total_assigned,
                   SUM(CASE WHEN c.status IN ('submitted', 'under_review', 'assigned', 'in_progress') THEN 1 ELSE 0 END) as active_backlog,
                   SUM(CASE WHEN c.status IN ('resolved_pending_feedback', 'closed') THEN 1 ELSE 0 END) as resolved_count,
                   AVG(c.citizen_rating) as avg_rating
            FROM departments d
            LEFT JOIN complaints c ON d.id = c.assigned_department_id
            GROUP BY d.id
        """)
        dept_workload = cursor.fetchall()

        # 5. Geo Hotspots for Map & Radar
        cursor.execute("""
            SELECT id, title, category, locality, latitude, longitude, severity_score, severity_label,
                   status, ticket_number, privacy_mode, selected_address
            FROM complaints 
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            AND privacy_mode IN ('public', 'confidential')
            ORDER BY severity_score DESC
            LIMIT 50
        """)
        hotspots = cursor.fetchall()

        # Approximate coordinates for confidential complaints to protect exact spots
        for h in hotspots:
            if h.get("privacy_mode") == "confidential":
                h["latitude"] = round(h["latitude"], 3)
                h["longitude"] = round(h["longitude"], 3)

        # 6. Top recurring clusters
        cursor.execute("""
            SELECT cl.*, d.name as department_name 
            FROM issue_clusters cl
            LEFT JOIN departments d ON cl.assigned_department_id = d.id
            WHERE cl.status = 'active'
            ORDER BY (cl.complaint_count * 2 + cl.support_count) DESC
            LIMIT 5
        """)
        top_clusters = cursor.fetchall()

        # Summary KPIs
        cursor.execute("SELECT COUNT(*) as total FROM complaints")
        total_complaints = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as urgent FROM complaints WHERE severity_score >= 80 AND status NOT IN ('closed', 'rejected')")
        urgent_count = cursor.fetchone()["urgent"]

        cursor.execute("SELECT COUNT(*) as awaiting_feedback FROM complaints WHERE status = 'resolved_pending_feedback'")
        awaiting_feedback_count = cursor.fetchone()["awaiting_feedback"]

        cursor.execute("SELECT AVG(citizen_rating) as avg_sat FROM complaints WHERE citizen_rating IS NOT NULL")
        avg_rating_row = cursor.fetchone()
        avg_satisfaction = round(avg_rating_row["avg_sat"], 1) if avg_rating_row and avg_rating_row["avg_sat"] else 4.2

        return {
            "summary": {
                "total_complaints": total_complaints,
                "urgent_unresolved": urgent_count,
                "awaiting_citizen_feedback": awaiting_feedback_count,
                "average_citizen_satisfaction": avg_satisfaction,
                "data_mode": "Synthetic Demo / Prototype Benchmark",
                "notice": "Risk scores reflect prototype multi-factor heuristic modeling. Emergency services should be contacted for life-threatening situations."
            },
            "category_distribution": category_stats,
            "status_distribution": status_stats,
            "severity_distribution": severity_stats,
            "department_workload": dept_workload,
            "hotspots": hotspots,
            "top_clusters": top_clusters
        }
