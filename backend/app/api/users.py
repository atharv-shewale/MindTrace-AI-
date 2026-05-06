from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
from datetime import datetime
from app.core.security import get_current_user
from app.core.database import get_database
from bson import ObjectId
from pydantic import BaseModel
from app.utils.mock_data import seed_mock_data
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/seed-mock-data")
async def trigger_seed_mock_data(
    current_user: dict = Depends(get_current_user)
):
    """Trigger the generation of 7 days of mock historical data for the user."""
    user_id = current_user["sub"]
    return await seed_mock_data(user_id)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    theme_preference: Optional[str] = None
    age: Optional[int] = None
    timezone: Optional[str] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    bio: Optional[str] = None
    notification_enabled: Optional[bool] = None
    public_profile: Optional[bool] = None
    guardian_email: Optional[str] = None
    interests: Optional[List[str]] = None
    background_tracking_enabled: Optional[bool] = None
    report_enabled: Optional[bool] = None
    report_frequency: Optional[str] = None


def _serialize_profile(user: dict) -> dict:
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
        "age": user.get("age"),
        "timezone": user.get("timezone", "UTC"),
        "gender": user.get("gender"),
        "occupation": user.get("occupation"),
        "bio": user.get("bio"),
        "notification_enabled": user.get("notification_enabled", True),
        "public_profile": user.get("public_profile", False),
        "guardian_email": user.get("guardian_email"),
        "interests": user.get("interests", []),
        "background_tracking_enabled": user.get("background_tracking_enabled", False),
        "report_enabled": user.get("report_enabled", True),
        "report_frequency": user.get("report_frequency", "daily"),
    }


@router.get("/profile")
async def get_user_profile(
    current_user: dict = Depends(get_current_user)
):
    """Get user profile"""
    user_id = current_user["sub"]
    db = get_database()
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return _serialize_profile(user)


@router.put("/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    user_id = current_user["sub"]
    db = get_database()
    
    updates = {"updated_at": datetime.utcnow()}
    
    name = profile_data.full_name or profile_data.name
    if name:
        updates["name"] = name
    if profile_data.avatar_url:
        updates["avatar_url"] = profile_data.avatar_url
    if profile_data.theme_preference:
        if profile_data.theme_preference not in ["light", "dark", "system"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid theme preference"
            )
        updates["theme_preference"] = profile_data.theme_preference
    if profile_data.age is not None:
        updates["age"] = profile_data.age
    if profile_data.timezone:
        updates["timezone"] = profile_data.timezone
    if profile_data.gender is not None:
        updates["gender"] = profile_data.gender
    if profile_data.occupation is not None:
        updates["occupation"] = profile_data.occupation
    if profile_data.bio is not None:
        updates["bio"] = profile_data.bio
    if profile_data.notification_enabled is not None:
        updates["notification_enabled"] = profile_data.notification_enabled
    if profile_data.public_profile is not None:
        updates["public_profile"] = profile_data.public_profile
    if profile_data.guardian_email is not None:
        updates["guardian_email"] = profile_data.guardian_email
    if profile_data.interests is not None:
        updates["interests"] = profile_data.interests
    if profile_data.background_tracking_enabled is not None:
        updates["background_tracking_enabled"] = profile_data.background_tracking_enabled
    if profile_data.report_enabled is not None:
        updates["report_enabled"] = profile_data.report_enabled
    if profile_data.report_frequency is not None:
        updates["report_frequency"] = profile_data.report_frequency
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    return _serialize_profile(updated_user)


@router.get("/wellness-stats")
async def get_wellness_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get user's overall wellness statistics"""
    user_id = current_user["sub"]
    db = get_database()
    
    # Get latest wellness score
    latest_score = await db.wellness_scores.find_one(
        {"user_id": user_id},
        sort=[("date", -1)]
    )
    
    # Get 30-day stats
    from datetime import timedelta
    thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
    
    scores = await db.wellness_scores.find({
        "user_id": user_id,
        "date": {"$gte": thirty_days_ago}
    }).to_list(None)
    
    # Calculate averages
    if scores:
        avg_wellness = sum(s.get("emotional_wellness_score", 50) for s in scores) / len(scores)
        avg_stability = sum(s.get("stability_score", 50) for s in scores) / len(scores)
        avg_recovery = sum(s.get("recovery_index", 50) for s in scores) / len(scores)
    else:
        avg_wellness = avg_stability = avg_recovery = 50.0
    
    # Get total emotion events
    total_events = await db.realtime_emotion_events.count_documents({"user_id": user_id})
    
    # Get total journaling entries
    total_journals = await db.journal_entries.count_documents({"user_id": user_id})
    
    # Get total interventions
    total_interventions = await db.intervention_logs.count_documents({"user_id": user_id})
    
    return {
        "current_wellness_score": latest_score.get("emotional_wellness_score") if latest_score else None,
        "avg_wellness_30d": round(avg_wellness, 2),
        "avg_stability_30d": round(avg_stability, 2),
        "avg_recovery_30d": round(avg_recovery, 2),
        "total_emotion_events": total_events,
        "total_journal_entries": total_journals,
        "total_interventions": total_interventions,
        "streak_days": await _calculate_engagement_streak(db, user_id)
    }


async def _calculate_engagement_streak(db, user_id: str) -> int:
    """Calculate days of consecutive engagement"""
    from datetime import timedelta
    
    streak = 0
    current_date = datetime.utcnow().date()
    
    while True:
        date_str = current_date.strftime("%Y-%m-%d")
        
        # Check if user had any activity this day
        activity = await db.realtime_emotion_events.count_documents({
            "user_id": user_id,
            "timestamp": {
                "$gte": datetime.strptime(date_str, "%Y-%m-%d"),
                "$lt": datetime.strptime(date_str, "%Y-%m-%d") + timedelta(days=1)
            }
        })
        
        if activity > 0:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    return streak


@router.get("/activity-summary")
async def get_activity_summary(
    days: int = 7,
    current_user: dict = Depends(get_current_user)
):
    """Get activity summary for a period"""
    user_id = current_user["sub"]
    db = get_database()
    
    from datetime import timedelta
    cutoff_time = datetime.utcnow() - timedelta(days=days)
    
    # Count activities by day
    daily_activity = {}
    
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        date_start = datetime.strptime(date, "%Y-%m-%d")
        date_end = date_start + timedelta(days=1)
        
        emotions = await db.realtime_emotion_events.count_documents({
            "user_id": user_id,
            "timestamp": {"$gte": date_start, "$lt": date_end}
        })
        
        journals = await db.journal_entries.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": date_start, "$lt": date_end}
        })
        
        interventions = await db.intervention_logs.count_documents({
            "user_id": user_id,
            "timestamp": {"$gte": date_start, "$lt": date_end}
        })
        
        daily_activity[date] = {
            "emotions_logged": emotions,
            "journal_entries": journals,
            "interventions_used": interventions,
            "total_activities": emotions + journals + interventions
        }
    
    return {
        "period_days": days,
        "daily_activity": daily_activity
    }


@router.post("/preferences")
async def save_user_preferences(
    preferences: dict,
    current_user: dict = Depends(get_current_user)
):
    """Save user preferences and settings"""
    user_id = current_user["sub"]
    db = get_database()
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "preferences": preferences,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "preferences_saved": True
    }


@router.get("/data-export")
async def export_user_data(
    current_user: dict = Depends(get_current_user)
):
    """Export user's data for privacy/portability"""
    user_id = current_user["sub"]
    db = get_database()
    
    # Collect all user data
    emotions = await db.realtime_emotion_events.find({"user_id": user_id}).to_list(None)
    journals = await db.journal_entries.find({"user_id": user_id}).to_list(None)
    wellness_scores = await db.wellness_scores.find({"user_id": user_id}).to_list(None)
    
    # Convert ObjectIds to strings
    for item in emotions + journals + wellness_scores:
        if "_id" in item:
            item["_id"] = str(item["_id"])
    
    return {
        "export_date": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "data": {
            "emotions": emotions,
            "journals": journals,
            "wellness_scores": wellness_scores
        }
    }
