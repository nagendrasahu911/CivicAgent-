# CivicSaathi AI 🏛️
> **“Your Voice. Smarter Action. Accountable Communities.”**

CivicSaathi AI is an independent, production-grade civic technology platform engineered to bridge the accountability gap between citizens and municipal authorities. It features multilingual voice reporting (Hindi & English), smart TF-IDF semantic duplicate detection, community issue clustering with deduplicated upvoting, explainable 0–100 priority scoring, and citizen-verified resolution closure.

---

## 🌟 Core Signature Innovations

1. **Multilingual AI Problem Intake & Voice Reporting**
   - Direct support for **Hindi (Devanagari)**, **Hinglish**, and **English**.
   - Speech-to-text recording with live audio presets (`hindi_pothole`, `hindi_garbage`, `english_water_leak`, `english_streetlight`), playback, and editable transcripts.
   - Explainable 0–100 priority scoring formula:
     $$\text{Score} = \text{Safety Risk (40)} + \text{Public Impact (25)} + \text{Time Unresolved (15)} + \text{Evidence Quality (10)} + \text{Cluster Density (10)}$$

2. **Smart Duplicate Detection & Community Issue Clustering**
   - Cross-language TF-IDF semantic matching (e.g., mapping Hindi *"सड़क पर बड़ा गड्ढा"* or *"Road mein bada gaddha"* to *"Dangerous deep pothole"*).
   - Haversine distance geofencing (150m immediate vicinity filter) ensuring distant reports with identical text do not falsely match.
   - Allows citizens to back existing clusters to elevate municipal urgency rather than generating duplicate paperwork.
   - Server-side unique vote deduplication per citizen account.

3. **Citizen-Verified Resolution Closure**
   - An authorized officer marking an issue resolved does **not** close it!
   - Tickets transition to `Resolved — Awaiting Citizen Feedback`.
   - Complainants inspect the repair, review before/after photo evidence, submit 1–5 stars, or reopen the ticket with an escalation reason.

4. **Three Strict Complaint Privacy Modes (Zero-Knowledge Isolation)**
   - **Public:** Sanitized summary visible on public feed, clusters, and map.
   - **Private:** Visible *only* to the reporting citizen and authorized department officers; strictly excluded from public queries.
   - **Confidential Public-Interest (Whistleblower):** Personal identity and sensitive coordinates masked in public feeds until moderator triage.

---

## 📁 Project Directory Structure

```
Civic Agent/
├── backend/
│   ├── app/
│   │   ├── config.py                 # Paths, JWT settings, CORS
│   │   ├── database.py               # SQLite schema, connection pool & indexes
│   │   ├── main.py                   # FastAPI app entrypoint
│   │   ├── models.py                 # Data constants
│   │   ├── schemas.py                # Pydantic request & response models
│   │   ├── seed_data.py              # Realistic multi-role seed generator
│   │   ├── routers/
│   │   │   ├── auth.py               # Auth, JWT, role check, demo switchers
│   │   │   ├── complaints.py         # AI analysis, CRUD, lifecycle, verification
│   │   │   ├── clusters.py           # Community issue clustering & upvoting
│   │   │   ├── analytics.py          # Civic Risk Radar & spatial hotspots
│   │   │   ├── notifications.py      # In-app user notification center
│   │   │   ├── departments.py        # Municipal divisions & officer rosters
│   │   │   └── admin.py              # Audit logs, speech gateway, factory reset
│   │   └── services/
│   │       ├── ai_analyzer.py        # Multilingual NLP, 0-100 severity formula
│   │       ├── duplicate_detector.py # TF-IDF vectorizer + Haversine geo filter
│   │       ├── department_router.py  # Intelligent explainable department routing
│   │       └── speech_service.py     # Bilingual speech transcription & presets
│   ├── test_core.py                  # Automated test suite (all 7 tests pass)
│   ├── run.py                        # Backend launcher script
│   └── requirements.txt              # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Logo.tsx              # Custom pin + community checkmark motif
│   │   │   ├── Navbar.tsx            # Navigation, notification badge, language
│   │   │   ├── Footer.tsx            # Transparency notices & quick links
│   │   │   ├── QuickDemoBar.tsx      # 1-click Hackathon persona switcher
│   │   │   ├── GoogleMap.tsx         # Google Maps JS API with Places, GPS & Pins
│   │   │   ├── LeafletMap.tsx        # Backward-compatible wrapper aliased to GoogleMap
│   │   │   ├── StatusBadge.tsx       # Color-coded lifecycle status pill
│   │   │   ├── PriorityBadge.tsx     # 0-100 severity badge
│   │   │   └── TimelineView.tsx      # Chronological activity history audit
│   │   ├── utils/
│   │   │   └── googleMapsLoader.ts   # Google Maps script loader & reverse geocoder
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Session state, demo roles, accessibility
│   │   ├── views/                    # 18 Essential Platform Pages
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginRegisterView.tsx
│   │   │   ├── CitizenDashboard.tsx
│   │   │   ├── NewComplaintView.tsx
│   │   │   ├── MyComplaintsView.tsx
│   │   │   ├── ComplaintDetailsView.tsx
│   │   │   ├── PublicExplorerView.tsx
│   │   │   ├── CommunityClustersView.tsx
│   │   │   ├── CivicRiskRadarView.tsx
│   │   │   ├── NotificationsView.tsx
│   │   │   ├── OfficerDashboard.tsx
│   │   │   ├── OfficerReviewQueueView.tsx
│   │   │   ├── DepartmentManagementView.tsx
│   │   │   ├── ClusterManagementView.tsx
│   │   │   ├── AdminDashboardView.tsx
│   │   │   ├── UserProfileAccessibilityView.tsx
│   │   │   ├── PrivacyHelpView.tsx
│   │   │   └── ProjectInfoDemoGuideView.tsx
│   │   ├── types.ts                  # TypeScript definitions
│   │   ├── App.tsx                   # Main view router
│   │   ├── main.tsx                  # React DOM mount
│   │   └── index.css                 # Tailwind CSS v4 styling
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .env.example                      # Environment template
├── run_dev.bat                       # Windows batch runner
├── run_dev.ps1                       # PowerShell launcher
└── README.md                         # Documentation
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Google Maps JavaScript & Places API Configuration

CivicSaathi AI uses the official **Google Maps JavaScript API** with **Places Autocomplete** and **Geocoding** to deliver real roads, streets, landmarks, and draggable GPS pinning.

#### Steps to configure your Google Maps API Key:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Link a billing account (Google Cloud provides **\$200 free monthly credit**, covering tens of thousands of map loads and place searches).
4. Navigate to **APIs & Services > Library** and enable:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
5. Navigate to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
6. **Apply Security Restrictions (Best Practice):**
   - **Application Restrictions:** Select *Websites (HTTP referrers)* and add:
     - `http://localhost:5173/*`
     - `http://127.0.0.1:5173/*`
     - `https://your-production-domain.com/*`
   - **API Restrictions:** Select *Restrict key* and check only *Maps JavaScript API*, *Places API*, and *Geocoding API*.
7. Add the key to `frontend/.env` (or copy from `frontend/.env.example`):
   ```bash
   # frontend/.env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourRealKeyHere
   ```
> [!NOTE]
> **Graceful Fallback Mode:** If no Google Maps API key is provided or if network is offline, CivicSaathi AI automatically activates a graceful fallback mode. Citizens can still use browser GPS auto-detection, type addresses manually, and submit complaints with zero disruption or blank screens.

---

### 4. Run Automated Tests
```bash
python backend/test_core.py
```
*Output will verify all 7 core logic tests (AI categorization, duplicate detection, negative geographic filtering, support vote deduplication, timeline preservation).*

### 5. Start the Application
You can run both servers simultaneously with the Windows launch script:
```powershell
.\run_dev.ps1
```
Or start them in two separate terminal windows:

**Terminal 1 (Backend API):**
```bash
python backend/run.py
# Backend runs at http://127.0.0.1:8000
# Interactive Swagger Docs at http://127.0.0.1:8000/docs
```

**Terminal 2 (Frontend Web Application):**
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🔑 Demo Accounts & 1-Click Persona Switcher

The application features a **Hackathon Evaluation Bar** at the top of every screen that allows you to switch roles in a single click:

| Role | Name | Email | Password | Primary Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Aarav Sharma | `citizen@civicsaathi.org` | `DemoPass123!` | Civil Lines resident, reporting & verification |
| **Field Officer** | Er. Rajesh Kumar | `officer.roads@civicsaathi.org` | `DemoPass123!` | Municipal Roads engineer, review & assignments |
| **Field Officer** | Anita Deshmukh | `officer.sanitation@civicsaathi.org` | `DemoPass123!` | Solid Waste Management |
| **Moderator** | Sunita Nair | `moderator@civicsaathi.org` | `DemoPass123!` | Civic HQ, cluster merge & whistleblower triage |
| **Administrator** | Civic Admin | `admin@civicsaathi.org` | `DemoPass123!` | System diagnostics, audit logs & factory reset |

---

## 🎯 9-Step Evaluator Presentation Flow

Follow this 3-minute sequence to demonstrate the complete bidirectional civic workflow (also available interactively inside the app via **Demo Guide** tab):

1. **Submit Hindi Complaint:** Click *"Report Issue"* as **Citizen (Aarav)**. Click *"Hindi Voice Preset: Road Pothole"* (`"सिविल लाइन्स मेन रोड पर गहरा गड्ढा है..."`).
2. **AI Analysis:** Click *"Analyze with AI & Check Duplicates"*. Notice the AI categorizes it as *"Potholes and damaged roads"*, computes a 78/100 severity score, recommends *Municipal Roads Engineering*, and flags missing landmark info.
3. **Smart Duplicate Warning:** Notice the yellow duplicate alert: AI detected an existing report within 59 meters in Civil Lines with 84% similarity.
4. **Community Upvoting:** Click *"Support This Existing Issue"* to back the existing cluster (`cls-civil-lines-pothole`) rather than generating duplicate paperwork.
5. **Officer Triage:** Switch role to **Field Officer (Er. Rajesh)** via the top bar. Open the *Review Queue* to inspect pending triage reports.
6. **Assign Crew:** Select a report, verify the department, assign a field inspector, add internal notes, and click *"Commit Triage Decision"*.
7. **Resolution Proof:** Open ticket `CIVIC-2026-10290` (Sector 14 Garbage). Review the officer's resolution note and before/after photo evidence.
8. **Citizen Verification & Reopen:** Switch back to **Citizen (Aarav)**. Notice the emerald callout banner *"Resolution Verification Needed"*. Rate 1–5 stars, or choose *"Not Resolved"* with an escalation note to reopen the ticket.
9. **Civic Risk Radar:** Open the *Risk Radar* tab to see live spatial hotspots, department backlogs, and recurring complaint trends.

---

## 🛡️ Feature Matrix: Working vs. Simulated Capabilities

| Feature | Engineering Status | Implementation Details |
| :--- | :--- | :--- |
| **Multilingual AI Problem Intake** | ✅ **Fully Operational** | Scikit-learn NLP + bilingual keyword dictionary for Devanagari Hindi, Hinglish, & English. |
| **Smart Duplicate Detection** | ✅ **Fully Operational** | TF-IDF text matching + Haversine distance geofencing with negative geographic filtering. |
| **Community Issue Clustering** | ✅ **Fully Operational** | Server-side unique vote deduplication per user, officer merge/split operations. |
| **Citizen-Verified Resolution** | ✅ **Fully Operational** | `resolved_pending_feedback` lifecycle state; 1-5 rating; reopen escalation audit trail. |
| **3 Privacy Modes** | ✅ **Fully Operational** | SQLite database query sanitization; private records strictly hidden from public endpoints. |
| **Interactive Google Maps & Places** | ✅ **Fully Operational** | Real Google Maps JS API with Places Autocomplete, browser GPS auto-detect, draggable incident markers, status-colored pins, interactive InfoWindows, hotspot radar circles, and graceful missing-key fallback. |
| **Multilingual Voice Input** | ⚡ **Operational Hybrid** | Browser Web Speech API + 4 high-fidelity Hindi/English audio presets for reliable evaluation. |
| **Municipal ERP Dispatch** | 🔮 **Future Integration** | Webhook simulator implemented; live dispatch requires verified administrative agreements. |

---

## 📜 Independent Civic-Tech Platform Disclaimer
CivicSaathi AI is an independent, open civic-technology platform developed for demonstration and hackathon evaluation. CivicSaathi AI does not claim official municipal endorsement or government ownership. Official complaint delivery operates only when verified integration agreements are in place.
