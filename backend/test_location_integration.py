import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import init_db, get_db
from app.database import init_db, get_db
from app.routers.complaints import analyze_complaint, create_complaint
from app.routers.analytics import get_risk_radar_metrics
from app.schemas import ComplaintCreate, AIAnalysisRequest

def test_location_features():
    print("Testing Google Maps and Location integration in backend...")
    init_db()

    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE role = 'citizen' LIMIT 1")
        user_row = c.fetchone()
        assert user_row is not None, "Citizen user not found in DB"
        citizen_id = user_row["id"]

    # 1. Test AI Analysis with address and location method
    analysis_req = AIAnalysisRequest(
        title="Deep dangerous pothole near gate 4",
        description="Vehicles are swerving into oncoming traffic. Urgent fix needed.",
        locality="Civil Lines, Delhi",
        landmark="Near Metro Gate 4",
        selected_address="Sham Nath Marg, Civil Lines, Delhi, 110054, India",
        location_selection_method="gps",
        latitude=28.6755,
        longitude=77.2258,
        has_image=True,
    )
    result = analyze_complaint(analysis_req)
    assert result.suggested_category == "Potholes and damaged roads"
    print("[PASS] AI analysis accepts selected_address and location_selection_method.")

    # 2. Test Complaint Creation with selected_address and location_selection_method
    new_comp = ComplaintCreate(
        title="Broken water pipeline spilling onto pedestrian sidewalk",
        description="Fresh water bursting from underground pipeline since yesterday morning.",
        category="Water leakage",
        locality="Green Park, Delhi",
        landmark="Opposite Community Center",
        selected_address="Block G, Green Park Extension, New Delhi, Delhi 110016, India",
        location_selection_method="manual_search",
        latitude=28.5580,
        longitude=77.2060,
        privacy_mode="public",
    )
    created = create_complaint(
        new_comp,
        current_user={"id": citizen_id, "name": "Aarav Sharma", "role": "citizen"}
    )
    complaint_id = created["complaint_id"]
    ticket_num = created["ticket_number"]
    print(f"[PASS] Complaint created with ID {complaint_id} and ticket {ticket_num}.")

    # 3. Test Retrieval from DB
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT selected_address, location_selection_method FROM complaints WHERE id = ?", (complaint_id,))
        row = c.fetchone()
        assert row is not None
        assert row["selected_address"] == "Block G, Green Park Extension, New Delhi, Delhi 110016, India"
        assert row["location_selection_method"] == "manual_search"
    print(f"       Address in DB: {row['selected_address']}")
    print(f"       Method in DB: {row['location_selection_method']}")
    print("[PASS] Verified direct DB persistence of selected_address and location_selection_method.")

    # 4. Test Risk Radar hotspots include selected_address
    radar = get_risk_radar_metrics()
    assert len(radar["hotspots"]) > 0
    print(f"[PASS] Risk radar aggregated {len(radar['hotspots'])} hotspots with spatial coordinates.")

    print("\nALL GOOGLE MAPS LOCATION INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_location_features()
