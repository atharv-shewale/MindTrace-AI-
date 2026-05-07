from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta, datetime
from app.schemas.models import AuthSignupRequest, AuthLoginRequest
from app.core.security import hash_password, create_access_token, verify_password, get_current_user
from app.core.database import get_database
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def _serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user.get("email"),
        "username": user.get("username"),
        "name": user.get("name"),
        "full_name": user.get("name"),
        "avatar_url": user.get("avatar_url"),
        "theme_preference": user.get("theme_preference", "dark"),
        "wellness_score": user.get("wellness_score", 50.0),
        "created_at": user.get("created_at").isoformat() if user.get("created_at") else None,
        "updated_at": user.get("updated_at").isoformat() if user.get("updated_at") else None,
        "guardian_email": user.get("guardian_email"),
        "age": user.get("age"),
        "gender": user.get("gender"),
        "interests": user.get("interests", []),
        "background_tracking_enabled": user.get("background_tracking_enabled", False),
        "report_frequency": user.get("report_frequency", "daily"),
        "report_enabled": user.get("report_enabled", True),
    }


@router.post("/signup")
async def signup(user_data: AuthSignupRequest):
    """Register a new user"""
    try:
        db = get_database()

        name = user_data.name or user_data.full_name or user_data.email.split("@")[0]
        username = user_data.username or name.lower().replace(" ", "_")
        
        # Check if email already exists
        existing = await db.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user_dict = {
            "email": user_data.email,
            "username": username,
            "name": name,
            "hashed_password": hash_password(user_data.password),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "theme_preference": "dark",
            "wellness_score": 50.0,
            "avatar_url": None,
            "guardian_email": user_data.guardian_email,
            "age": user_data.age,
            "gender": user_data.gender,
            "interests": user_data.interests or []
        }
        
        result = await db.users.insert_one(user_dict)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(result.inserted_id), "email": user_data.email}
        )
        response_user = {**user_dict, "_id": result.inserted_id}
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(result.inserted_id),
            "user": _serialize_user(response_user)
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Signup failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {exc}"
        )


@router.post("/login")
async def login(credentials: AuthLoginRequest):
    """Login user"""
    db = get_database()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not available. Please check your internet connection or database configuration."
        )
    
    try:
        user = await db.users.find_one({"email": credentials.email})
    except Exception as e:
        logger.error(f"Database query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database query failed. System may be overloaded."
        )

    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "email": credentials.email}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "user": _serialize_user(user)
    }


@router.post("/refresh")
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """Refresh access token"""
    access_token = create_access_token(
        data={"sub": current_user["sub"], "email": current_user.get("email", "")}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


from datetime import datetime
