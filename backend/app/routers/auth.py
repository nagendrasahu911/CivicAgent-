"""
Authentication and Role-Based Access Control Router for CivicSaathi AI
Supports Citizens, Field Officers, Department Moderators, and Admins.
"""
import uuid
import hashlib
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, Dict, Any

from app.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
from app.database import get_db
from app.schemas import UserRegister, UserLogin, TokenResponse, UserProfile

router = APIRouter(prefix="/api/auth", tags=["auth"])

def hash_password(password: str) -> str:
    # Deterministic salted SHA-256 for fast, zero-dependency demo reliability
    salt = "civicsaathi_salt_secure_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def create_access_token(user_id: str, role: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "role": role,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp())
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication credentials required")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT u.*, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="User account not found")
        return user

def require_role(allowed_roles: list):
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}")
        return current_user
    return role_checker

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (req.email.lower(),))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Account with this email already exists")

        user_id = f"usr-{uuid.uuid4().hex[:10]}"
        pwd_hash = hash_password(req.password)
        
        cursor.execute("""
            INSERT INTO users (id, email, name, password_hash, role, department_id, phone, locality, preferred_language)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, req.email.lower(), req.name, pwd_hash, 
            req.role or 'citizen', req.department_id, req.phone, req.locality, req.preferred_language
        ))

        token = create_access_token(user_id, req.role or 'citizen', req.email.lower())
        
        user_profile = UserProfile(
            id=user_id,
            email=req.email.lower(),
            name=req.name,
            role=req.role or 'citizen',
            department_id=req.department_id,
            department_name=None,
            phone=req.phone,
            locality=req.locality,
            preferred_language=req.preferred_language or 'en',
            created_at=datetime.now().isoformat()
        )
        return TokenResponse(access_token=token, user=user_profile)

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.*, d.name as department_name 
            FROM users u 
            LEFT JOIN departments d ON u.department_id = d.id 
            WHERE lower(u.email) = ?
        """, (req.email.lower(),))
        user = cursor.fetchone()
        
        if not user or user["password_hash"] != hash_password(req.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token(user["id"], user["role"], user["email"])
        
        user_profile = UserProfile(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            department_id=user["department_id"],
            department_name=user["department_name"],
            phone=user["phone"],
            locality=user["locality"],
            preferred_language=user["preferred_language"] or 'en',
            created_at=str(user["created_at"])
        )
        return TokenResponse(access_token=token, user=user_profile)

@router.get("/me", response_model=UserProfile)
def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return UserProfile(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        department_id=current_user["department_id"],
        department_name=current_user["department_name"],
        phone=current_user["phone"],
        locality=current_user["locality"],
        preferred_language=current_user["preferred_language"] or 'en',
        created_at=str(current_user["created_at"])
    )

@router.post("/demo-switch/{role}", response_model=TokenResponse)
def switch_demo_role(role: str):
    """
    Fast hackathon/evaluation role switcher that logs in as verified demo accounts.
    Allows testing citizen, field officer, department moderator, and administrator views seamlessly.
    """
    role_email_map = {
        "citizen": "citizen@civicsaathi.org",
        "officer": "officer.roads@civicsaathi.org",
        "moderator": "moderator@civicsaathi.org",
        "admin": "admin@civicsaathi.org"
    }
    
    target_email = role_email_map.get(role.lower())
    if not target_email:
        raise HTTPException(status_code=400, detail="Invalid demo role. Choose citizen, officer, moderator, or admin")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.*, d.name as department_name 
            FROM users u 
            LEFT JOIN departments d ON u.department_id = d.id 
            WHERE lower(u.email) = ?
        """, (target_email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Demo user not found. Please reset demo data.")

        token = create_access_token(user["id"], user["role"], user["email"])
        
        user_profile = UserProfile(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            department_id=user["department_id"],
            department_name=user["department_name"],
            phone=user["phone"],
            locality=user["locality"],
            preferred_language=user["preferred_language"] or 'en',
            created_at=str(user["created_at"])
        )
        return TokenResponse(access_token=token, user=user_profile)
