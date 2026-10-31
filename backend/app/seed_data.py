"""
Seed Data Generator for CivicSaathi AI
Generates realistic multi-department, multi-status, multilingual complaints,
clusters, users, timelines, and verification data.
"""
import uuid
import json
from app.database import get_db
from app.routers.auth import hash_password
from app.services.department_router import DEPARTMENTS

def seed_database():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if users already seeded
        cursor.execute("SELECT COUNT(*) as count FROM users")
        if cursor.fetchone()["count"] > 0:
            return  # Already seeded

        print("Seeding CivicSaathi AI database...")

        # 1. Insert Departments
        for d in DEPARTMENTS:
            cursor.execute("""
                INSERT OR REPLACE INTO departments (id, name, code, description, contact_email, sla_hours, active)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            """, (d["id"], d["name"], d["code"], d["description"], d["contact_email"], d["sla_hours"]))

        # 2. Insert Users
        pwd_hash = hash_password("DemoPass123!")

        demo_users = [
            # Citizen
            ("usr-citizen-1", "citizen@civicsaathi.org", "Aarav Sharma", pwd_hash, "citizen", None, "+91 98765 43210", "Civil Lines, Delhi", "en"),
            ("usr-citizen-2", "priya.verma@example.com", "Priya Verma", pwd_hash, "citizen", None, "+91 98111 22334", "Koramangala, Bengaluru", "hi"),
            ("usr-citizen-3", "vikram.singh@example.com", "Vikram Singh", pwd_hash, "citizen", None, "+91 98222 33445", "Andheri West, Mumbai", "en"),
            
            # Field Officers
            ("usr-officer-roads", "officer.roads@civicsaathi.org", "Er. Rajesh Kumar", pwd_hash, "officer", "dept-roads", "+91 94123 45678", "Central Zone", "en"),
            ("usr-officer-sanitation", "officer.sanitation@civicsaathi.org", "Anita Deshmukh", pwd_hash, "officer", "dept-sanitation", "+91 94234 56789", "East Zone", "hi"),
            ("usr-officer-water", "officer.water@civicsaathi.org", "Mohammad Farooq", pwd_hash, "officer", "dept-water", "+91 94345 67890", "South Zone", "en"),
            
            # Moderator
            ("usr-moderator-1", "moderator@civicsaathi.org", "Sunita Nair", pwd_hash, "moderator", None, "+91 95000 11223", "City Headquarters", "en"),
            
            # Admin
            ("usr-admin-1", "admin@civicsaathi.org", "Civic System Administrator", pwd_hash, "admin", None, "+91 90000 00001", "Municipal Command Centre", "en")
        ]

        for u in demo_users:
            cursor.execute("""
                INSERT INTO users (id, email, name, password_hash, role, department_id, phone, locality, preferred_language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, u)

        # 3. Insert Clusters
        clusters = [
            ("cls-civil-lines-pothole", "Civil Lines Arterial Road Crater & Pothole Hazard", "Potholes and damaged roads", "Civil Lines, Delhi", 28.6750, 77.2250, "active", 14, 3, "dept-roads", 1),
            ("cls-sector14-garbage", "Sector 14 Market Overflowing Garbage & Filth", "Garbage and sanitation", "Sector 14 Market, Delhi", 28.6320, 77.1980, "active", 28, 4, "dept-sanitation", 1),
            ("cls-greenpark-water", "Green Park Ext Main Pipeline Leakage", "Water leakage", "Green Park Extension, Delhi", 28.5580, 77.2020, "active", 9, 2, "dept-water", 1),
            ("cls-koramangala-light", "7th Cross Streetlight Block Outage", "Streetlight faults", "Koramangala 4th Block, Bengaluru", 12.9340, 77.6250, "active", 19, 2, "dept-lighting", 1),
            ("cls-andheri-drain", "SV Road Waterlogging & Blocked Drain", "Drainage and waterlogging", "Andheri West, Mumbai", 19.1190, 72.8460, "active", 22, 2, "dept-drainage", 1)
        ]

        for cl in clusters:
            cursor.execute("""
                INSERT INTO issue_clusters (id, title, category, locality, latitude, longitude, status, support_count, complaint_count, assigned_department_id, confirmed_by_officer)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, cl)

        # 4. Complaints dataset
        complaints_data = [
            # 1. Pothole cluster - English report
            {
                "id": "cmp-pothole-eng",
                "ticket": "CIVIC-2026-10442",
                "user_id": "usr-citizen-1",
                "title": "Dangerous deep pothole on Civil Lines main arterial road",
                "desc": "There is a massive 2-foot deep pothole on the main road right near Gate 2 of the metro station. Heavy traffic swerves suddenly and two-wheelers are skidding. Needs urgent patch repair.",
                "cat": "Potholes and damaged roads",
                "lang": "en",
                "privacy": "public",
                "status": "in_progress",
                "locality": "Civil Lines, Delhi",
                "landmark": "Near Metro Gate 2",
                "lat": 28.6752, "lon": 77.2251,
                "dept": "dept-roads",
                "officer": "usr-officer-roads",
                "score": 78,
                "label": "High",
                "cluster_id": "cls-civil-lines-pothole",
                "img": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
                "notes": "Materials dispatched from Central Asphalt Plant. Bitumen cold-mix patch work scheduled for 2 PM shift."
            },
            # 2. Pothole cluster - POSITIVE DUPLICATE in Hindi! ("Road mein bada gaddha hai")
            {
                "id": "cmp-pothole-hindi",
                "ticket": "CIVIC-2026-10449",
                "user_id": "usr-citizen-2",
                "title": "सिविल लाइन्स मेन रोड में बहुत बड़ा और खतरनाक गड्ढा है",
                "desc": "सिविल लाइन्स मुख्य सड़क पर मेट्रो स्टेशन के पास सड़क टूट चुकी है और बहुत बड़ा गड्ढा बन गया है। कल रात एक स्कूटी चालक गिरते-गिरते बचा। कृपया तत्काल मरम्मत करवाएं।",
                "cat": "Potholes and damaged roads",
                "lang": "hi",
                "privacy": "public",
                "status": "in_progress",
                "locality": "Civil Lines, Delhi",
                "landmark": "Opposite Pillar 45",
                "lat": 28.6755, "lon": 77.2254,
                "dept": "dept-roads",
                "officer": "usr-officer-roads",
                "score": 76,
                "label": "High",
                "cluster_id": "cls-civil-lines-pothole",
                "img": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
                "notes": "Grouped with Cluster cls-civil-lines-pothole. Unified contractor work order issued."
            },
            # 3. NEGATIVE DUPLICATE EXAMPLE: Pothole in distant location (Sector 45 Gurgaon - 35km away)
            # Same keywords (pothole, deep, dangerous) but completely different location -> MUST NOT CLUSTER
            {
                "id": "cmp-pothole-distant",
                "ticket": "CIVIC-2026-10512",
                "user_id": "usr-citizen-3",
                "title": "Deep pothole and road breakdown at Sector 45 Highway Junction",
                "desc": "Deep pothole on the outer slip road near Sector 45 Highway exit. Cars hitting it at 50kmph causing severe rim damage.",
                "cat": "Potholes and damaged roads",
                "lang": "en",
                "privacy": "public",
                "status": "under_review",
                "locality": "Sector 45, Gurugram",
                "landmark": "Near Highway Exit 12",
                "lat": 28.4350, "lon": 77.0620,
                "dept": "dept-roads",
                "officer": None,
                "score": 72,
                "label": "High",
                "cluster_id": None, # Standalone because it is 35km away from Civil Lines!
                "img": None,
                "notes": "Location verified independently. Distant from Delhi central clusters."
            },
            # 4. Resolved complaint AWAITING CITIZEN FEEDBACK (Demonstrates the verification workflow!)
            {
                "id": "cmp-garbage-resolved-pending",
                "ticket": "CIVIC-2026-10290",
                "user_id": "usr-citizen-1",
                "title": "Unattended rotting garbage heap outside Community Center",
                "desc": "Garbage has not been collected for 5 days. Foul smell and stray cattle blocking pedestrian movement.",
                "cat": "Garbage and sanitation",
                "lang": "en",
                "privacy": "public",
                "status": "resolved_pending_feedback",
                "locality": "Sector 14 Market, Delhi",
                "landmark": "Near Community Hall Gate",
                "lat": 28.6322, "lon": 77.1983,
                "dept": "dept-sanitation",
                "officer": "usr-officer-sanitation",
                "score": 65,
                "label": "High",
                "cluster_id": "cls-sector14-garbage",
                "img": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80",
                "res_img": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80",
                "res_notes": "Sanitation compactor truck deployed at 07:30 AM. Vat cleared, lime powder sprayed across 50 sq meters. Photo proof attached."
            },
            # 5. Reopened Complaint (Demonstrates citizen feedback rejected & reopened with historical timeline preserved)
            {
                "id": "cmp-water-reopened",
                "ticket": "CIVIC-2026-10115",
                "user_id": "usr-citizen-1",
                "title": "Underground potable water pipe burst creating sinkhole",
                "desc": "Water line burst beneath pavement. High volume potable water lost and road sub-base eroding.",
                "cat": "Water leakage",
                "lang": "en",
                "privacy": "public",
                "status": "reopened",
                "locality": "Green Park Extension, Delhi",
                "landmark": "Adjacent to House 42",
                "lat": 28.5582, "lon": 77.2024,
                "dept": "dept-water",
                "officer": "usr-officer-water",
                "score": 85,
                "label": "Urgent Review",
                "cluster_id": "cls-greenpark-water",
                "img": "https://images.unsplash.com/photo-1542013936693-884638332954?w=600&auto=format&fit=crop&q=80",
                "notes": "Reopened after citizen inspection revealed joint clamp continues to seep water.",
                "reopen_reason": "Contractor only put mud over the leak without tightening the flange collar. Water started seeping again within 3 hours."
            },
            # 6. Confidential Public-Interest Complaint (Identity protected, anonymized in public)
            {
                "id": "cmp-confidential-infra",
                "ticket": "CIVIC-2026-10881",
                "user_id": "usr-citizen-2",
                "title": "Substandard concrete crumbling on new pedestrian skywalk",
                "desc": "Confidential civic alert: The support railing concrete on the newly opened pedestrian bridge has visible structural cracks and hollow patches. Poses serious fall hazard.",
                "cat": "Public infrastructure damage",
                "lang": "en",
                "privacy": "confidential",
                "status": "accepted",
                "locality": "Andheri West, Mumbai",
                "landmark": "Near Skywalk Pier 3",
                "lat": 19.1195, "lon": 72.8468,
                "dept": "dept-infra",
                "officer": None,
                "score": 88,
                "label": "Urgent Review",
                "cluster_id": None,
                "img": None,
                "notes": "Confidential whistleblowing complaint. Whistleblower identity protected."
            },
            # 7. Private Complaint (Visible ONLY to owner and authorized officers)
            {
                "id": "cmp-private-sewage",
                "ticket": "CIVIC-2026-10992",
                "user_id": "usr-citizen-1",
                "title": "Private sewer line backflow into residential courtyard",
                "desc": "Municipal main sewer line is choked causing backflow into private house boundary. Raw sewage pooling in private property.",
                "cat": "Drainage and waterlogging",
                "lang": "en",
                "privacy": "private",
                "status": "submitted",
                "locality": "Civil Lines, Delhi",
                "landmark": "House 18-B, Private Lane",
                "lat": 28.6760, "lon": 77.2240,
                "dept": "dept-drainage",
                "officer": None,
                "score": 62,
                "label": "High",
                "cluster_id": None,
                "img": None,
                "notes": "Restricted visibility: Private complainant privacy mode."
            },
            # 8. Electricity Hazard (Urgent Review safety score: 92)
            {
                "id": "cmp-electric-hazard",
                "ticket": "CIVIC-2026-11005",
                "user_id": "usr-citizen-3",
                "title": "Live 11kV wire snapped and hanging at pedestrian eye level",
                "desc": "High voltage overhead power line snapped during storm and is dangling right over the sidewalk. Continuous electric sparks observed near tree branch.",
                "cat": "Electricity hazards",
                "lang": "en",
                "privacy": "public",
                "status": "assigned",
                "locality": "Koramangala 4th Block, Bengaluru",
                "landmark": "Near Bus Stop 14",
                "lat": 12.9348, "lon": 77.6258,
                "dept": "dept-power",
                "officer": None,
                "score": 92,
                "label": "Urgent Review",
                "cluster_id": None,
                "img": None,
                "notes": "CRITICAL ELECTRICAL HAZARD: Immediate substation feeder isolation requested."
            }
        ]

        for c in complaints_data:
            cursor.execute("""
                INSERT INTO complaints (
                    id, ticket_number, user_id, title, description, category, original_language,
                    privacy_mode, status, locality, landmark, latitude, longitude,
                    suggested_category, suggested_department_id, assigned_department_id, assigned_officer_id,
                    severity_score, severity_label, ai_summary, confidence_score,
                    image_url, resolution_evidence_url, resolution_notes, cluster_id,
                    reopen_reason, internal_officer_notes, created_at, updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, 0.95,
                    ?, ?, ?, ?,
                    ?, ?, datetime('now', '-2 days'), CURRENT_TIMESTAMP
                )
            """, (
                c["id"], c["ticket"], c["user_id"], c["title"], c["desc"], c["cat"], c["lang"],
                c["privacy"], c["status"], c["locality"], c["landmark"], c["lat"], c["lon"],
                c["cat"], c["dept"], c["dept"], c.get("officer"),
                c["score"], c["label"], f"{c['cat']} reported at {c['locality']}",
                c.get("img"), c.get("res_img"), c.get("res_notes"), c.get("cluster_id"),
                c.get("reopen_reason"), c.get("notes")
            ))

            # Timeline entries for this complaint
            cursor.execute("""
                INSERT INTO complaint_timeline (
                    id, complaint_id, action, old_status, new_status, actor_id, actor_name, actor_role, public_remarks, created_at
                ) VALUES (?, ?, 'status_change', NULL, 'submitted', ?, 'Citizen Reporter', 'citizen', 'Complaint registered on portal.', datetime('now', '-2 days'))
            """, (f"tml-{uuid.uuid4().hex[:10]}", c["id"], c["user_id"]))

            if c["status"] in ["in_progress", "resolved_pending_feedback", "reopened", "closed"]:
                cursor.execute("""
                    INSERT INTO complaint_timeline (
                        id, complaint_id, action, old_status, new_status, actor_id, actor_name, actor_role, public_remarks, created_at
                    ) VALUES (?, ?, 'assignment', 'submitted', 'assigned', 'usr-officer-roads', 'Er. Rajesh Kumar', 'officer', 'Assigned to Ward Quick Response Team.', datetime('now', '-1 day'))
                """, (f"tml-{uuid.uuid4().hex[:10]}", c["id"]))

            if c.get("res_notes"):
                cursor.execute("""
                    INSERT INTO complaint_timeline (
                        id, complaint_id, action, old_status, new_status, actor_id, actor_name, actor_role, public_remarks, evidence_url, created_at
                    ) VALUES (?, ?, 'status_change', 'in_progress', 'resolved_pending_feedback', 'usr-officer-sanitation', 'Anita Deshmukh', 'officer', ?, ?, datetime('now', '-4 hours'))
                """, (f"tml-{uuid.uuid4().hex[:10]}", c["id"], c["res_notes"], c.get("res_img")))

            if c.get("reopen_reason"):
                cursor.execute("""
                    INSERT INTO complaint_timeline (
                        id, complaint_id, action, old_status, new_status, actor_id, actor_name, actor_role, public_remarks, created_at
                    ) VALUES (?, ?, 'reopened', 'resolved_pending_feedback', 'reopened', 'usr-citizen-1', 'Aarav Sharma', 'citizen', ?, datetime('now', '-1 hour'))
                """, (f"tml-{uuid.uuid4().hex[:10]}", c["id"], f"Reopened by citizen: {c['reopen_reason']}"))

        # 5. Pre-seed support votes for clusters
        cursor.execute("INSERT OR IGNORE INTO cluster_support_votes (id, cluster_id, user_id) VALUES ('vot-1', 'cls-civil-lines-pothole', 'usr-citizen-1')")
        cursor.execute("INSERT OR IGNORE INTO cluster_support_votes (id, cluster_id, user_id) VALUES ('vot-2', 'cls-civil-lines-pothole', 'usr-citizen-2')")
        cursor.execute("INSERT OR IGNORE INTO cluster_support_votes (id, cluster_id, user_id) VALUES ('vot-3', 'cls-sector14-garbage', 'usr-citizen-1')")

        # 6. Notifications for demo citizen
        cursor.execute("""
            INSERT INTO notifications (id, user_id, title, message, type, link, is_read)
            VALUES 
            ('ntf-demo-1', 'usr-citizen-1', 'Resolution Verification Needed', 'Your complaint CIVIC-2026-10290 has been marked resolved. Please confirm if the garbage was cleared.', 'feedback_requested', '/complaints/cmp-garbage-resolved-pending', 0),
            ('ntf-demo-2', 'usr-citizen-1', 'Work in Progress', 'Maintenance crew has been dispatched for Pothole report CIVIC-2026-10442.', 'status_update', '/complaints/cmp-pothole-eng', 1)
        """)

        # 7. Audit logs
        cursor.execute("""
            INSERT INTO audit_logs (id, actor_id, actor_role, action, target_entity, target_id, details)
            VALUES 
            ('aud-init-1', 'usr-admin-1', 'admin', 'system_seed', 'database', 'system', 'Initialized CivicSaathi AI realistic demo baseline.'),
            ('aud-init-2', 'usr-officer-roads', 'officer', 'cluster_confirm', 'issue_cluster', 'cls-civil-lines-pothole', 'Confirmed Civil Lines Road Crater cluster.')
        """)

        print("CivicSaathi AI database successfully seeded with realistic multi-role data!")
