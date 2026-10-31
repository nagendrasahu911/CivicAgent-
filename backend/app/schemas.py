"""
Pydantic Schemas for CivicSaathi AI
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    locality: Optional[str] = "Civil Lines, Delhi"
    preferred_language: Optional[str] = "en"
    role: Optional[str] = "citizen"
    department_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    role: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    phone: Optional[str] = None
    locality: Optional[str] = None
    preferred_language: str = "en"
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

class AIAnalysisRequest(BaseModel):
    title: str
    description: str
    locality: Optional[str] = ""
    landmark: Optional[str] = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    selected_address: Optional[str] = ""
    has_image: bool = False
    has_audio: bool = False

class DuplicateMatch(BaseModel):
    complaint_id: str
    ticket_number: str
    title: str
    category: str
    locality: str
    similarity_score: float
    distance_meters: Optional[float] = None
    matching_reasons: List[str]
    cluster_id: Optional[str] = None
    cluster_support_count: Optional[int] = 0

class AIAnalysisResult(BaseModel):
    suggested_category: str
    suggested_department: str
    suggested_department_id: str
    confidence: float
    severity_score: int
    severity_label: str
    severity_factors: Dict[str, Any]
    ai_summary: str
    ai_explanation: str
    missing_info_warnings: List[str]
    detected_language: str
    possible_duplicates: List[DuplicateMatch] = []

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    locality: str
    landmark: Optional[str] = ""
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090
    selected_address: Optional[str] = None
    location_selection_method: Optional[str] = "map_pin" # gps, manual_search, map_pin
    privacy_mode: str = "public" # public, private, confidential
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    audio_transcript: Optional[str] = None
    join_cluster_id: Optional[str] = None # If citizen chooses to join/support an existing cluster instead

class ComplaintStatusUpdate(BaseModel):
    status: str
    public_remarks: Optional[str] = None
    internal_remarks: Optional[str] = None
    rejection_reason: Optional[str] = None
    assigned_department_id: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolution_evidence_url: Optional[str] = None

class CitizenFeedback(BaseModel):
    rating: int = Field(ge=1, le=5)
    feedback_status: str # fully_resolved, partially_resolved, not_resolved
    comments: Optional[str] = None
    reopen_requested: bool = False
    reopen_reason: Optional[str] = None
    feedback_evidence_url: Optional[str] = None

class ClusterAction(BaseModel):
    action: str # confirm, merge, split, reject
    target_cluster_id: Optional[str] = None
    complaint_ids: Optional[List[str]] = None
    notes: Optional[str] = None
