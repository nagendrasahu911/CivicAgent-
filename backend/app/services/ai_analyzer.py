"""
AI Analysis Engine for CivicSaathi AI
Multilingual classification, explainable priority scoring, and missing information checks.
"""
import re
from typing import Dict, Any, List, Tuple

# Categories supported
CATEGORIES = [
    "Potholes and damaged roads",
    "Garbage and sanitation",
    "Water leakage",
    "Water supply problems",
    "Drainage and waterlogging",
    "Streetlight faults",
    "Public infrastructure damage",
    "Electricity hazards",
    "Other civic issues"
]

# Multilingual keywords dictionary for Hindi, Hinglish, and English
CATEGORY_KEYWORDS = {
    "Potholes and damaged roads": [
        "pothole", "potholes", "crater", "road", "damaged road", "asphalt", "broken road",
        "gaddha", "gadde", "sadak", "rastaa", "rasta", "tuti sadak", "khadda", "speedbreaker", "road repair",
        "गड्ढा", "गड्ढे", "सड़क", "रास्ता", "टूटी सड़क", "खड्डा", "डामर", "गड्ढों"
    ],
    "Garbage and sanitation": [
        "garbage", "trash", "waste", "dump", "dustbin", "litter", "filth", "dead animal", "stench",
        "kachra", "kachre", "kuda", "kude", "gandagi", "safai", "dher", "badbu", "kachrewala",
        "कचरा", "कूड़ा", "गंदगी", "सफाई", "बदबू", "कचरे", "कूड़े", "सफाईकर्मी"
    ],
    "Water leakage": [
        "leak", "leakage", "pipe burst", "burst pipe", "pipeline", "leaking tap", "spraying water",
        "paani beh raha", "pipe phat gaya", "leakage", "pipeline leak", "pani barbad",
        "पानी बह रहा", "पाइप फट", "लीकेज", "पानी का रिसाव", "पाइपलाइन"
    ],
    "Water supply problems": [
        "water supply", "no water", "dirty water", "contaminated", "muddy water", "low pressure", "tanker",
        "pani nahi aa raha", "peene ka pani", "ganda pani", "supply band", "badbu wala pani",
        "पानी नहीं आ रहा", "पीने का पानी", "गंदा पानी", "सप्लाई बंद", "पानी की किल्लत"
    ],
    "Drainage and waterlogging": [
        "drain", "drainage", "waterlogging", "flooding", "overflow", "gutter", "clogged", "manhole",
        "nali", "nala", "pani bhara", "jalbhorav", "gutter jaam", "nali block", "manhole khula",
        "नाली", "नाला", "पानी भरा", "जलभराव", "गटर जाम", "सीवर", "मैनहोल"
    ],
    "Streetlight faults": [
        "streetlight", "street light", "lamp", "pole light", "darkness", "bulb", "flickering",
        "batti", "light band", "andhera", "khambha", "pole ki light", "street light kharab",
        "स्ट्रीट लाइट", "बत्ती", "अंधेरा", "खंभा", "लाइट बंद", "रोड लाइट"
    ],
    "Public infrastructure damage": [
        "divider", "footpath", "sidewalk", "railing", "park bench", "bus stop", "public toilet", "bridge",
        "footpath toota", "divider tuta", "park ki boundary", "bus stop damaged",
        "फुटपाथ", "डिवाइडर", "पुल", "रेलिंग", "बस स्टॉप", "पार्क"
    ],
    "Electricity hazards": [
        "wire", "sparking", "high voltage", "transformer", "electric pole", "hanging wire", "shock", "short circuit",
        "taar latak raha", "bijli ka taar", "spark ho raha", "transformer kharab", "current aa raha", "bijli ka khamba",
        "बिजली का तार", "करंट", "स्पार्क", "ट्रांसफार्मर", "तार लटक", "शॉर्ट सर्किट"
    ]
}

# High safety risk phrases
HAZARD_PHRASES = [
    "sparking", "current", "shock", "hanging wire", "wire open", "live wire", "open manhole",
    "deep crater", "accident", "fatal", "dangerous", "urgent", "taar khula", "bijli current",
    "manhole khula", "bada hadsa", "khatarnak", "gir gaya", "खतरनाक", "करंट", "हादसा", "गहरा गड्ढा"
]

HIGH_IMPACT_PHRASES = [
    "main road", "highway", "school", "hospital", "market", "metro station", "bus stand", "junction",
    "bheed", "bazar", "chauraha", "hospital ke pas", "school ke bahar", "traffic jam",
    "मुख्य सड़क", "स्कूल", "अस्पताल", "बाजार", "चौराहा"
]

def detect_language(text: str) -> str:
    hindi_devanagari = len(re.findall(r'[\u0900-\u097F]', text))
    if hindi_devanagari > 3:
        return "Hindi (Devanagari)"
    # Check for hinglish common words
    hinglish_tokens = ["hai", "mein", "gaddha", "sadak", "kachra", "paani", "nali", "batti", "se", "aur", "pe", "kar", "raha"]
    text_lower = text.lower()
    matches = sum(1 for tok in hinglish_tokens if re.search(r'\b' + tok + r'\b', text_lower))
    if matches >= 2:
        return "Hinglish (Hindi in Roman script)"
    return "English"

def classify_complaint(title: str, description: str) -> Tuple[str, float, str]:
    combined = (title + " " + description).lower()
    scores = {}
    
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = 0
        for kw in keywords:
            kw_lower = kw.lower()
            # If keyword is Devanagari or has spaces, use simple substring match
            is_devanagari = bool(re.search(r'[\u0900-\u097F]', kw))
            if " " in kw_lower or is_devanagari:
                if kw_lower in combined:
                    score += 3.0
            else:
                matches = len(re.findall(r'\b' + re.escape(kw_lower) + r'\b', combined))
                score += matches * 1.5
        scores[cat] = score
        
    best_cat = max(scores, key=scores.get)
    best_score = scores[best_cat]
    
    if best_score == 0:
        return "Other civic issues", 0.50, "General civic issue detected; human review recommended to confirm categorization."
    
    confidence = min(0.96, 0.65 + (best_score * 0.05))
    reason = f"Identified primary civic indicators matching {best_cat} with strong signal keywords."
    return best_cat, round(confidence, 2), reason

def calculate_severity(title: str, description: str, locality: str, has_image: bool, has_audio: bool) -> Dict[str, Any]:
    combined = (title + " " + description + " " + locality).lower()
    
    # 1. Safety Risk (0 - 40 points)
    safety_points = 12
    safety_reasons = []
    for hazard in HAZARD_PHRASES:
        if hazard in combined:
            safety_points += 14
            safety_reasons.append(f"Contains safety hazard indicator '{hazard}'")
            break
            
    if "electricity hazards" in combined or "sparking" in combined or "live wire" in combined or "current" in combined:
        safety_points = max(safety_points, 38)
        safety_reasons.append("High-voltage electrical hazard risk")
    elif "open manhole" in combined or "manhole khula" in combined:
        safety_points = max(safety_points, 36)
        safety_reasons.append("Uncovered manhole pedestrian hazard")
    elif "pothole" in combined or "gaddha" in combined:
        if "deep" in combined or "bada" in combined or "accident" in combined:
            safety_points = max(safety_points, 32)
            safety_reasons.append("Deep road depression posing vehicular crash hazard")
        else:
            safety_points = max(safety_points, 20)
    safety_points = min(40, max(5, safety_points))
    
    # 2. Public Impact (0 - 25 points)
    impact_points = 10
    impact_reasons = []
    for phrase in HIGH_IMPACT_PHRASES:
        if phrase in combined:
            impact_points += 12
            impact_reasons.append(f"Located near critical public facility: '{phrase}'")
            break
    impact_points = min(25, max(5, impact_points))
    
    # 3. Time unresolved (0 - 15 points) - For fresh report baseline
    time_points = 6
    if any(k in combined for k in ["days", "din", "week", "hafte", "months", "mahina"]):
        time_points = 13
        time_reason = "Complainant explicitly reports persistent multi-day problem"
    else:
        time_reason = "Standard baseline for newly registered complaint"
        
    # 4. Evidence quality (0 - 10 points)
    evidence_points = 4
    evidence_desc = "Text narrative provided"
    if has_image and has_audio:
        evidence_points = 10
        evidence_desc = "High-fidelity multimedia report (Visual proof + Voice testimony)"
    elif has_image:
        evidence_points = 9
        evidence_desc = "Photographic documentation attached"
    elif has_audio:
        evidence_points = 8
        evidence_desc = "Voice recording attached"
        
    # 5. Related Area Cluster Density (0 - 10 points)
    cluster_points = 5  # Baseline default; updated when duplicate/cluster detector runs
    
    total_score = safety_points + impact_points + time_points + evidence_points + cluster_points
    total_score = min(100, max(0, total_score))
    
    if total_score >= 80:
        label = "Urgent Review"
        action = "Prioritize for same-day field inspection and hazard mitigation"
    elif total_score >= 60:
        label = "High"
        action = "Dispatch to department officer within 24 hours"
    elif total_score >= 30:
        label = "Medium"
        action = "Schedule in standard municipal maintenance queue (48-72h SLA)"
    else:
        label = "Normal"
        action = "Review and queue according to standard ward maintenance calendar"
        
    return {
        "score": total_score,
        "label": label,
        "recommended_action": action,
        "breakdown": {
            "safety_risk": {"score": safety_points, "max": 40, "notes": ", ".join(safety_reasons) or "Moderate baseline safety concern"},
            "public_impact": {"score": impact_points, "max": 25, "notes": ", ".join(impact_reasons) or "Local neighborhood impact"},
            "time_unresolved": {"score": time_points, "max": 15, "notes": time_reason},
            "evidence_quality": {"score": evidence_points, "max": 10, "notes": evidence_desc},
            "cluster_density": {"score": cluster_points, "max": 10, "notes": "Local zone complaint density factor"}
        }
    }

def detect_missing_info(title: str, description: str, locality: str, landmark: str, has_image: bool) -> List[str]:
    warnings = []
    if len(description.strip().split()) < 6:
        warnings.append("Description is very brief. Adding specific details about the size or exact timing will speed up response.")
    if not landmark or len(landmark.strip()) < 3:
        warnings.append("No nearby landmark or house/shop number provided. Adding a landmark helps field inspectors pinpoint the spot.")
    if not has_image:
        warnings.append("No photograph attached. Attaching an image speeds up verification by up to 60%.")
    return warnings

def generate_ai_summary(title: str, description: str, category: str, locality: str) -> str:
    # Build clean concise 1-2 sentence executive summary
    desc_clean = re.sub(r'\s+', ' ', description.strip())
    if len(desc_clean) > 130:
        desc_clean = desc_clean[:127] + "..."
    return f"{category} reported at {locality}. Citizen states: \"{desc_clean}\""
