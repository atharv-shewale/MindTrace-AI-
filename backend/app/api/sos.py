from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from datetime import datetime
from app.core.security import get_current_user
from app.core.database import get_database
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/contact/add")
async def add_sos_contact(
    name: str,
    contact_type: str,
    phone: Optional[str] = None,
    email: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Add a trusted SOS contact"""
    user_id = current_user["sub"]
    db = get_database()
    
    if not phone and not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one contact method required"
        )
    
    contact_doc = {
        "user_id": user_id,
        "name": name,
        "phone": phone,
        "email": email,
        "type": contact_type,
        "created_at": datetime.utcnow()
    }
    
    result = await db.sos_contacts.insert_one(contact_doc)
    
    return {
        "contact_id": str(result.inserted_id),
        "added": True
    }


@router.get("/contact/list")
async def get_sos_contacts(
    current_user: dict = Depends(get_current_user)
):
    """Get all SOS contacts"""
    user_id = current_user["sub"]
    db = get_database()
    
    contacts = await db.sos_contacts.find({"user_id": user_id}).to_list(None)
    
    for contact in contacts:
        contact["_id"] = str(contact["_id"])
    
    return {
        "contacts": contacts,
        "count": len(contacts)
    }


@router.delete("/contact/{contact_id}")
async def delete_sos_contact(
    contact_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a SOS contact"""
    user_id = current_user["sub"]
    db = get_database()
    
    try:
        result = await db.sos_contacts.delete_one({
            "_id": ObjectId(contact_id),
            "user_id": user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact not found"
            )
        
        return {"deleted": True}
    except Exception as e:
        logger.error(f"Error deleting contact: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid contact ID"
        )


@router.post("/alert")
async def send_sos_alert(
    severity_level: str,
    message: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Send SOS alert (staged escalation system).
    
    Levels:
    - soft: Gentle check-in
    - moderate: Share with trusted person
    - urgent: Emergency support
    """
    user_id = current_user["sub"]
    db = get_database()
    
    alert_doc = {
        "user_id": user_id,
        "severity_level": severity_level,
        "message": message,
        "sent_at": datetime.utcnow(),
        "acknowledged": False
    }
    
    result = await db.sos_alerts.insert_one(alert_doc)
    
    return {
        "alert_sent": True,
        "alert_id": str(result.inserted_id),
        "level": severity_level,
        "message": "Your support network has been notified" if severity_level == "urgent" else "Alert sent"
    }


@router.get("/safety-resources")
async def get_safety_resources():
    """Get emergency and safety resources"""
    resources = {
        "crisis_lines": [
            {
                "name": "National Suicide Prevention Lifeline",
                "number": "988",
                "available": "24/7"
            },
            {
                "name": "Crisis Text Line",
                "text": "Text HOME to 741741",
                "available": "24/7"
            }
        ],
        "self_care": [
            "Practice deep breathing",
            "Move your body gently",
            "Reach out to someone",
            "Do something small you enjoy"
        ],
        "emergency": "If you're in immediate danger, please call 911 or your local emergency number."
    }
    
    return resources
