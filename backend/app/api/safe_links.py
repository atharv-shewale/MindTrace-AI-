from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from datetime import datetime
from app.core.security import get_current_user
from app.core.database import get_database
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/add")
async def add_safe_link(
    title: str,
    url: str,
    category: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Add a safe link to comfort content.
    
    Categories: music, video, meditation, exercise, motivation, grounding
    """
    user_id = current_user["sub"]
    db = get_database()
    
    # Validate URL
    if not url.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL must start with http:// or https://"
        )
    
    link_doc = {
        "user_id": user_id,
        "title": title,
        "url": url,
        "category": category.lower(),
        "created_at": datetime.utcnow(),
        "access_count": 0
    }
    
    result = await db.user_safe_links.insert_one(link_doc)
    
    return {
        "link_id": str(result.inserted_id),
        "added": True
    }


@router.get("/list")
async def get_safe_links(
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's safe links"""
    user_id = current_user["sub"]
    db = get_database()
    
    query = {"user_id": user_id}
    if category:
        query["category"] = category.lower()
    
    links = await db.user_safe_links.find(query).sort("created_at", -1).to_list(None)
    
    for link in links:
        link["_id"] = str(link["_id"])
    
    return {
        "links": links,
        "count": len(links),
        "category_filter": category
    }


@router.get("/categories")
async def get_link_categories():
    """Get available link categories"""
    categories = [
        {
            "id": "music",
            "name": "Calming Music",
            "description": "Peaceful music and playlists"
        },
        {
            "id": "video",
            "name": "Calm Videos",
            "description": "Relaxing video content"
        },
        {
            "id": "meditation",
            "name": "Meditation",
            "description": "Guided meditations"
        },
        {
            "id": "exercise",
            "name": "Movement/Exercise",
            "description": "Gentle movement and yoga"
        },
        {
            "id": "motivation",
            "name": "Motivational",
            "description": "Inspiring and uplifting content"
        },
        {
            "id": "grounding",
            "name": "Grounding",
            "description": "Grounding techniques and exercises"
        }
    ]
    
    return {"categories": categories}


@router.post("/{link_id}/access")
async def access_safe_link(
    link_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Record access to a safe link"""
    user_id = current_user["sub"]
    db = get_database()
    
    try:
        link = await db.user_safe_links.find_one_and_update(
            {
                "_id": ObjectId(link_id),
                "user_id": user_id
            },
            {
                "$inc": {"access_count": 1},
                "$set": {"last_accessed": datetime.utcnow()}
            }
        )
        
        if not link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Safe link not found"
            )
        
        return {
            "url": link["url"],
            "title": link["title"],
            "opened": True
        }
    
    except Exception as e:
        logger.error(f"Error accessing link: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid link ID"
        )


@router.delete("/{link_id}")
async def delete_safe_link(
    link_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a safe link"""
    user_id = current_user["sub"]
    db = get_database()
    
    try:
        result = await db.user_safe_links.delete_one({
            "_id": ObjectId(link_id),
            "user_id": user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Safe link not found"
            )
        
        return {"deleted": True}
    
    except Exception as e:
        logger.error(f"Error deleting link: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid link ID"
        )


@router.get("/dashboard/quick-access")
async def get_quick_access_links(
    current_user: dict = Depends(get_current_user)
):
    """Get top accessed safe links for quick access"""
    user_id = current_user["sub"]
    db = get_database()
    
    # Get top 5 most accessed links
    top_links = await db.user_safe_links.find(
        {"user_id": user_id}
    ).sort("access_count", -1).limit(5).to_list(None)
    
    for link in top_links:
        link["_id"] = str(link["_id"])
    
    # Also get one random link for discovery
    all_links = await db.user_safe_links.find(
        {"user_id": user_id}
    ).to_list(None)
    
    import random
    discovery_link = random.choice(all_links) if all_links else None
    
    return {
        "quick_access": top_links,
        "discovery": discovery_link,
        "total_links": len(all_links)
    }
