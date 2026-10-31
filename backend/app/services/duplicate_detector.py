"""
Smart Duplicate Detection & Community Clustering Engine
Uses TF-IDF, bilingual semantic concept mapping, geographic Haversine distance, and category alignment.
"""
import math
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Bilingual concept dictionary mapping Hindi/Hinglish terms to English canonical concepts
BILINGUAL_MAP = {
    # Road / Pothole
    "gaddha": "pothole road damage",
    "gadde": "pothole road damage",
    "khadda": "pothole road damage",
    "sadak": "road street avenue",
    "rasta": "road street pathway",
    "rastaa": "road street pathway",
    "tuti": "broken damaged cracked",
    "toota": "broken damaged fractured",
    "bada": "huge large deep massive",
    "badi": "huge large deep massive",
    
    # Garbage / Sanitation
    "kachra": "garbage waste trash litter",
    "kachre": "garbage waste trash litter",
    "kuda": "garbage waste trash litter",
    "kude": "garbage waste trash litter",
    "gandagi": "filth unhygienic dirt stench",
    "dher": "pile dump accumulation heap",
    "badbu": "foul smell stench odor",
    "safai": "cleanliness sanitation cleaning",
    
    # Water / Pipe
    "paani": "water supply pipeline",
    "pani": "water supply pipeline",
    "beh": "flowing leaking burst spillage",
    "phat": "burst rupture leak broken",
    "ganda": "dirty contaminated muddy contaminated",
    
    # Drainage
    "nali": "drain drainage canal gutter",
    "nala": "large drain canal sewer",
    "jaam": "blocked clogged choked overflow",
    "bhara": "waterlogged flooded overflow",
    "khula": "open uncovered dangerous exposed",
    
    # Hindi Devanagari mappings
    "गड्ढा": "pothole road damage crater",
    "गड्ढे": "pothole road damage crater",
    "सड़क": "road street avenue highway",
    "रास्ता": "road street pathway",
    "टूटी": "broken damaged cracked",
    "बड़ा": "huge large deep massive",
    "कचरा": "garbage waste trash litter",
    "कूड़ा": "garbage waste trash litter",
    "गंदगी": "filth unhygienic dirt stench",
    "पानी": "water supply pipeline leak",
    "नाली": "drain drainage canal gutter",
    "बत्ती": "light lamp streetlight illumination",
    "अंधेरा": "darkness dark unlit",
    "बिजली": "electricity electric power wire hazard",
    "तार": "electric wire cable"
}

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great circle distance between two points in meters."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 999999.0
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def expand_bilingual_text(text: str) -> str:
    """Expands Hindi/Hinglish terms with canonical English equivalents for cross-language matching."""
    tokens = text.lower().replace(",", " ").replace(".", " ").replace("-", " ").split()
    expanded = []
    for t in tokens:
        expanded.append(t)
        if t in BILINGUAL_MAP:
            expanded.append(BILINGUAL_MAP[t])
    return " ".join(expanded)

def find_duplicates(
    new_title: str,
    new_description: str,
    new_category: str,
    new_locality: str,
    new_lat: Optional[float],
    new_lon: Optional[float],
    existing_complaints: List[Dict[str, Any]],
    threshold: float = 0.55
) -> List[Dict[str, Any]]:
    """
    Evaluates new complaint against existing public or accessible complaints.
    Returns ranked candidate duplicates with similarity score and explanation.
    """
    if not existing_complaints:
        return []

    new_expanded = expand_bilingual_text(f"{new_title} {new_description} {new_category}")
    corpus = [new_expanded]
    
    for c in existing_complaints:
        c_expanded = expand_bilingual_text(f"{c.get('title', '')} {c.get('description', '')} {c.get('category', '')}")
        corpus.append(c_expanded)

    # 1. Compute TF-IDF text similarity with sublinear TF and n-grams
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    # Cosine similarity between new_complaint (index 0) and all existing (indices 1..N)
    cosine_sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    candidates = []

    for idx, comp in enumerate(existing_complaints):
        text_sim = float(cosine_sims[idx])
        matching_reasons = []
        
        # 2. Category matching
        cat_match = (new_category.strip().lower() == comp.get('category', '').strip().lower())
        if cat_match:
            category_score = 1.0
            matching_reasons.append(f"Identical civic category ({comp.get('category')})")
        else:
            category_score = 0.2

        # 3. Geo proximity (meters)
        c_lat = comp.get('latitude')
        c_lon = comp.get('longitude')
        dist_m = haversine_distance_meters(new_lat, new_lon, c_lat, c_lon)
        
        geo_score = 0.0
        if dist_m <= 150: # Within 150m: exact spot
            geo_score = 1.0
            matching_reasons.append(f"Within {int(dist_m)} meters of existing report (Immediate vicinity)")
        elif dist_m <= 500: # Within 500m: same neighborhood block
            geo_score = 0.8
            matching_reasons.append(f"Within {int(dist_m)} meters (Same neighborhood block)")
        elif dist_m <= 1500: # Within 1.5km
            geo_score = 0.4
            matching_reasons.append(f"Within {round(dist_m/1000, 1)} km (Same ward/locality)")
        else:
            # Over 1.5km: strongly penalize - DIFFERENT LOCATION CANNOT BE DUPLICATE
            geo_score = 0.05
            
        # Also check locality string token match
        if new_locality and comp.get('locality'):
            loc_tokens_new = set(new_locality.lower().replace(",", " ").split())
            loc_tokens_old = set(comp.get('locality', '').lower().replace(",", " ").split())
            common_loc = loc_tokens_new.intersection(loc_tokens_old)
            if common_loc and dist_m > 1500:
                geo_score = max(geo_score, 0.3)

        # 4. Text semantic match reason
        if text_sim >= 0.4:
            matching_reasons.append(f"High semantic narrative similarity ({int(text_sim * 100)}% match)")
        elif text_sim >= 0.25:
            matching_reasons.append(f"Moderate vocabulary and keyword overlap ({int(text_sim * 100)}% match)")

        # CRITICAL FILTER: If geographic distance is high (> 2000 meters) AND categories differ, it is definitely NOT a duplicate!
        if dist_m > 2000 and not (new_locality and comp.get('locality') and new_locality.strip().lower() == comp.get('locality', '').strip().lower()):
            # Different location negative example
            continue

        # Combined Composite Similarity Score
        # Weights: 45% Text Semantic, 35% Geo Proximity, 20% Category
        composite_score = (text_sim * 0.45) + (geo_score * 0.35) + (category_score * 0.20)
        
        # If geo is very close (< 200m) and category matches, strong signal
        if dist_m <= 200 and cat_match and text_sim > 0.2:
            composite_score = max(composite_score, 0.72)

        if composite_score >= threshold:
            candidates.append({
                "complaint_id": comp.get("id"),
                "ticket_number": comp.get("ticket_number"),
                "title": comp.get("title"),
                "category": comp.get("category"),
                "locality": comp.get("locality"),
                "similarity_score": round(composite_score, 2),
                "distance_meters": round(dist_m, 1) if dist_m < 999990 else None,
                "matching_reasons": matching_reasons,
                "cluster_id": comp.get("cluster_id"),
                "cluster_support_count": comp.get("cluster_support_count", 1)
            })

    # Sort descending by composite similarity score
    candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
    return candidates
