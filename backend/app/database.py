"""
CivicSaathi AI - SQLite Database Initialization and Connection Pool
"""
import sqlite3
import json
from contextlib import contextmanager
from app.config import DB_PATH

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        val = row[idx]
        # Auto-parse JSON fields if applicable
        if col[0].endswith(("_json", "_list", "_factors")):
            try:
                val = json.loads(val) if val else []
            except Exception:
                pass
        d[col[0]] = val
    return d

@contextmanager
def get_db():
    conn = sqlite3.connect(str(DB_PATH), timeout=20.0)
    conn.row_factory = dict_factory
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'citizen', -- citizen, officer, moderator, admin
            department_id TEXT,
            phone TEXT,
            locality TEXT,
            preferred_language TEXT DEFAULT 'en', -- en, hi
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Departments table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS departments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            description TEXT,
            contact_email TEXT,
            sla_hours INTEGER DEFAULT 48,
            active INTEGER DEFAULT 1
        );
        """)

        # 3. Complaints table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            ticket_number TEXT UNIQUE NOT NULL,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            original_language TEXT DEFAULT 'en', -- en, hi, hinglish
            privacy_mode TEXT NOT NULL DEFAULT 'public', -- public, private, confidential
            status TEXT NOT NULL DEFAULT 'submitted', 
            -- submitted, under_review, more_info_required, accepted, rejected, assigned, in_progress, resolved_pending_feedback, closed, reopened
            
            -- Location
            locality TEXT NOT NULL,
            landmark TEXT,
            latitude REAL,
            longitude REAL,
            selected_address TEXT,
            location_selection_method TEXT DEFAULT 'map_pin', -- gps, manual_search, map_pin
            
            -- AI Suggestions & Explainable Scoring
            suggested_category TEXT,
            suggested_department_id TEXT,
            assigned_department_id TEXT,
            assigned_officer_id TEXT,
            severity_score INTEGER DEFAULT 25, -- 0 to 100
            severity_label TEXT DEFAULT 'Normal', -- Normal, Medium, High, Urgent Review
            severity_factors_json TEXT, -- JSON breakdown: safety, public_impact, time, evidence, cluster
            ai_summary TEXT,
            ai_explanation TEXT,
            missing_info_json TEXT, -- JSON list of warnings
            confidence_score REAL DEFAULT 0.85,
            
            -- Media
            image_url TEXT,
            audio_url TEXT,
            audio_transcript TEXT,
            
            -- Clustering
            cluster_id TEXT,
            is_cluster_primary INTEGER DEFAULT 0,
            
            -- Resolution Details
            resolution_notes TEXT,
            resolution_evidence_url TEXT,
            resolved_at TIMESTAMP,
            
            -- Feedback & Reopen
            citizen_rating INTEGER, -- 1 to 5
            citizen_feedback_status TEXT, -- fully_resolved, partially_resolved, not_resolved
            citizen_feedback_notes TEXT,
            reopen_reason TEXT,
            
            rejection_reason TEXT,
            internal_officer_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (assigned_department_id) REFERENCES departments(id),
            FOREIGN KEY (assigned_officer_id) REFERENCES users(id)
        );
        """)

        # 4. Complaint Timeline / Activity History
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaint_timeline (
            id TEXT PRIMARY KEY,
            complaint_id TEXT NOT NULL,
            action TEXT NOT NULL, -- status_change, assignment, officer_note, citizen_feedback, reopened
            old_status TEXT,
            new_status TEXT,
            actor_id TEXT,
            actor_name TEXT,
            actor_role TEXT,
            public_remarks TEXT,
            internal_remarks TEXT,
            evidence_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
        );
        """)

        # 5. Issue Clusters
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS issue_clusters (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            locality TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            status TEXT DEFAULT 'active', -- active, merged, resolved
            support_count INTEGER DEFAULT 1,
            complaint_count INTEGER DEFAULT 1,
            assigned_department_id TEXT,
            confirmed_by_officer INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_department_id) REFERENCES departments(id)
        );
        """)

        # 6. Cluster Support Votes (deduplicated per user per cluster)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS cluster_support_votes (
            id TEXT PRIMARY KEY,
            cluster_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(cluster_id, user_id),
            FOREIGN KEY (cluster_id) REFERENCES issue_clusters(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        """)

        # 7. Notifications
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'status_update', -- status_update, assignment, feedback_requested, cluster_update
            link TEXT,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 8. Audit Logs
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            actor_id TEXT,
            actor_role TEXT,
            action TEXT NOT NULL,
            target_entity TEXT NOT NULL,
            target_id TEXT,
            details TEXT,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Indexes for fast querying
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_complaints_dept ON complaints(assigned_department_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_complaints_privacy ON complaints(privacy_mode);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_complaints_cluster ON complaints(cluster_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_timeline_complaint ON complaint_timeline(complaint_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);")

        # Auto-migrate existing database for Google Maps address & method fields
        cursor.execute("PRAGMA table_info(complaints);")
        columns_info = cursor.fetchall()
        col_names = [c["name"] if isinstance(c, dict) else c[1] for c in columns_info]
        if "selected_address" not in col_names:
            cursor.execute("ALTER TABLE complaints ADD COLUMN selected_address TEXT;")
        if "location_selection_method" not in col_names:
            cursor.execute("ALTER TABLE complaints ADD COLUMN location_selection_method TEXT DEFAULT 'map_pin';")
