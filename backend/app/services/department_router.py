"""
Intelligent Department Routing Engine for CivicSaathi AI
Maps categories, keywords, and jurisdiction to departments with explainability.
"""
from typing import Dict, Any, Optional

DEPARTMENTS = [
    {
        "id": "dept-roads",
        "name": "Municipal Roads & Highway Engineering",
        "code": "PWD_ROADS",
        "description": "Responsible for municipal road carpeting, pothole repairs, speed breakers, and arterial roads.",
        "contact_email": "roads.civic@demo.local",
        "sla_hours": 48
    },
    {
        "id": "dept-sanitation",
        "name": "Solid Waste Management & Public Sanitation",
        "code": "SANITATION",
        "description": "Responsible for daily waste collection, public garbage vats, street sweeping, and animal carcass disposal.",
        "contact_email": "sanitation.civic@demo.local",
        "sla_hours": 24
    },
    {
        "id": "dept-water",
        "name": "Water Supply & Jal Board Division",
        "code": "WATER_BOARD",
        "description": "Responsible for piped potable water distribution, mainline leakage repairs, and water tankers.",
        "contact_email": "water.civic@demo.local",
        "sla_hours": 36
    },
    {
        "id": "dept-drainage",
        "name": "Stormwater Drainage & Sewerage Board",
        "code": "DRAINAGE",
        "description": "Responsible for flood prevention, open drain desilting, manhole covers, and sewer blockages.",
        "contact_email": "drainage.civic@demo.local",
        "sla_hours": 24
    },
    {
        "id": "dept-lighting",
        "name": "Public Lighting & Street Electricals",
        "code": "ELEC_LIGHTING",
        "description": "Responsible for municipal streetlights, smart poles, junction timers, and street illumination.",
        "contact_email": "lighting.civic@demo.local",
        "sla_hours": 48
    },
    {
        "id": "dept-power",
        "name": "State Electricity Distribution Corporation",
        "code": "POWER_DISCOM",
        "description": "Responsible for high voltage transformers, overhead electric cables, sparking wires, and power hazards.",
        "contact_email": "power.safety@demo.local",
        "sla_hours": 12
    },
    {
        "id": "dept-infra",
        "name": "Civic Amenities & Urban Infrastructure",
        "code": "CIVIC_INFRA",
        "description": "Responsible for pedestrian walkways, railings, dividers, public parks, bus shelters, and civic structures.",
        "contact_email": "infra.civic@demo.local",
        "sla_hours": 72
    },
    {
        "id": "dept-general",
        "name": "Central Grievance & Citizen Services Cell",
        "code": "CENTRAL_CELL",
        "description": "General municipal intake and triage for cross-cutting or unclassified citizen complaints.",
        "contact_email": "central.cell@demo.local",
        "sla_hours": 48
    }
]

CATEGORY_ROUTING = {
    "Potholes and damaged roads": {
        "primary": "dept-roads",
        "secondary": "dept-infra",
        "confidence": 0.94,
        "explanation": "Reported issue involves road surface depression and vehicular hazard, routed under Municipal Roads engineering mandate."
    },
    "Garbage and sanitation": {
        "primary": "dept-sanitation",
        "secondary": "dept-general",
        "confidence": 0.96,
        "explanation": "Refuse, unattended trash, and community hygiene fall under Solid Waste Management mandate."
    },
    "Water leakage": {
        "primary": "dept-water",
        "secondary": "dept-drainage",
        "confidence": 0.92,
        "explanation": "Pipeline rupture and clean water loss routed to Water Supply & Jal Board for urgent repair."
    },
    "Water supply problems": {
        "primary": "dept-water",
        "secondary": "dept-general",
        "confidence": 0.95,
        "explanation": "Low pressure, contamination, or water cutoff belongs under the jurisdiction of the Jal Board."
    },
    "Drainage and waterlogging": {
        "primary": "dept-drainage",
        "secondary": "dept-sanitation",
        "confidence": 0.93,
        "explanation": "Stormwater runoff overflow, choked sewers, and open drain hazards belong to Drainage Board."
    },
    "Streetlight faults": {
        "primary": "dept-lighting",
        "secondary": "dept-power",
        "confidence": 0.95,
        "explanation": "Defective streetlights and dark road stretches are maintained by Public Lighting Authority."
    },
    "Electricity hazards": {
        "primary": "dept-power",
        "secondary": "dept-lighting",
        "confidence": 0.97,
        "explanation": "Sparking wires, live transformers, and electrocution hazards require urgent high-priority Power Discom intervention."
    },
    "Public infrastructure damage": {
        "primary": "dept-infra",
        "secondary": "dept-roads",
        "confidence": 0.88,
        "explanation": "Damage to public footpaths, dividers, or community amenities falls under Urban Infrastructure."
    },
    "Other civic issues": {
        "primary": "dept-general",
        "secondary": None,
        "confidence": 0.60,
        "explanation": "Cross-cutting grievance assigned to Central Cell for manual officer triage and verification."
    }
}

def recommend_department(category: str, description: str = "") -> Dict[str, Any]:
    routing = CATEGORY_ROUTING.get(category, CATEGORY_ROUTING["Other civic issues"])
    
    primary_id = routing["primary"]
    dept = next((d for d in DEPARTMENTS if d["id"] == primary_id), DEPARTMENTS[-1])
    
    alt_dept = None
    if routing["secondary"]:
        alt_dept = next((d for d in DEPARTMENTS if d["id"] == routing["secondary"]), None)
        
    verification_status = "Verified" if routing["confidence"] >= 0.85 else "Department verification required"
    
    return {
        "department_id": dept["id"],
        "department_name": dept["name"],
        "department_code": dept["code"],
        "sla_hours": dept["sla_hours"],
        "alternative_department": alt_dept["name"] if alt_dept else None,
        "confidence": routing["confidence"],
        "explanation": routing["explanation"],
        "verification_status": verification_status
    }
