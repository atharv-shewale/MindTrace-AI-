from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from datetime import datetime, timedelta
from app.core.security import get_current_user
from app.core.database import get_database
from app.services.emotional_tracking import emotional_tracking_engine
from collections import defaultdict
from app.services.groq_service import groq_service
import statistics

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary(
    days: int = 7,
    seed: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a comprehensive emotional analytics summary.
    Includes daily wellness index, emotion distribution, and insights.
    """
    user_id = current_user["sub"]
    db = get_database()
    
    # Optional: Seed mock data if requested and no data exists
    if seed:
        existing_journals = await db.journal_entries.count_documents({"user_id": user_id})
        if existing_journals == 0:
            import random
            for i in range(days + 5):
                date = datetime.utcnow() - timedelta(days=i)
                await db.journal_entries.insert_one({
                    "user_id": user_id,
                    "content": "Mock journal entry for analytics seeding.",
                    "positivity": random.uniform(0.4, 0.9),
                    "dominant_emotion": random.choice(["joy", "neutral", "surprise"]),
                    "created_at": date
                })
                await db.realtime_emotion_events.insert_one({
                    "user_id": user_id,
                    "emotion": random.choice(["joy", "neutral", "sadness", "anger"]),
                    "intensity": random.uniform(0.3, 0.8),
                    "timestamp": date
                })

    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # 1. Fetch historical journal entries
    journals = await db.journal_entries.find({
        "user_id": user_id,
        "created_at": {"$gt": cutoff_date}
    }).sort("created_at", 1).to_list(None)
    
    # 2. Fetch realtime emotion events
    events = await db.realtime_emotion_events.find({
        "user_id": user_id,
        "timestamp": {"$gt": cutoff_date}
    }).to_list(None)
    
    # 3. Calculate daily wellness index
    daily_scores = defaultdict(list)
    
    for j in journals:
        day_key = j["created_at"].strftime("%Y-%m-%d")
        daily_scores[day_key].append(j.get("positivity", 0.5) * 100)
        
    for e in events:
        day_key = e["timestamp"].strftime("%Y-%m-%d")
        # Joy/Neutral are positive, others reduce the score
        sentiment_score = 0.8 if e["emotion"] in ["joy", "surprise"] else 0.4
        daily_scores[day_key].append(sentiment_score * 100)
        
    # Aggregate daily averages
    history = []
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=days-1-i))
        date_str = date.strftime("%Y-%m-%d")
        scores = daily_scores.get(date_str, [65.0]) # Default 65 if no data
        avg_score = sum(scores) / len(scores)
        history.append({
            "day": date.strftime("%a"),
            "score": round(avg_score, 1),
            "date": date_str
        })
        
    # 4. Calculate Emotion Distribution
    emotion_counts = defaultdict(int)
    for e in events:
        emotion_counts[e["emotion"]] += 1
    
    total_events = len(events) or 1
    distribution = [
        {"emotion": k, "percentage": round((v / total_events) * 100, 1)}
        for k, v in emotion_counts.items()
    ]
    
    # 5. Generate AI Insights via Groq
    current_wellness = history[-1]["score"] if history else 0
    prev_wellness = history[-2]["score"] if len(history) > 1 else current_wellness
    change = current_wellness - prev_wellness
    
    dominant_emotion = distribution[0]["emotion"] if distribution else "neutral"
    
    # Fetch user profile for interests
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    interests = user.get("interests", [])

    import asyncio
    insight_task = groq_service.get_daily_quote(context=f"wellness index {current_wellness}% and dominant emotion {dominant_emotion}")
    suggestions_task = groq_service.get_personalized_suggestions(dominant_emotion, current_wellness/100, (change + 100)/200)
    hangouts_task = groq_service.get_place_suggestions(dominant_emotion, current_wellness/100, interests)
    
    # Async gather with exception handling
    results = await asyncio.gather(insight_task, suggestions_task, hangouts_task, return_exceptions=True)
    
    insight = results[0] if not isinstance(results[0], Exception) else "Your mind is a neural masterpiece."
    suggestions = results[1] if not isinstance(results[1], Exception) else ["Practice deep breathing."]
    hangouts = results[2] if not isinstance(results[2], Exception) else ["A quiet park."]
    
    # 6. Calculate Streak
    all_journals = await db.journal_entries.find({"user_id": user_id}, {"created_at": 1}).sort("created_at", -1).to_list(None)
    streak = 0
    if all_journals:
        current_date = datetime.utcnow().date()
        first_entry_date = all_journals[0]["created_at"].date()
        
        # Streak continues if they journaled today or yesterday
        if (current_date - first_entry_date).days <= 1:
            streak = 1
            check_date = first_entry_date
            
            # Count consecutive days backwards
            for j in all_journals[1:]:
                j_date = j["created_at"].date()
                if (check_date - j_date).days == 1:
                    streak += 1
                    check_date = j_date
                elif (check_date - j_date).days == 0:
                    continue # Multiple entries same day
                else:
                    break # Streak broken
    
    return {
        "wellness_index": round(current_wellness, 1),
        "wellness_change_pct": round(change, 1),
        "history": history,
        "distribution": sorted(distribution, key=lambda x: x["percentage"], reverse=True),
        "insight": insight,
        "suggestions": suggestions,
        "decompression_hangouts": hangouts,
        "background_tracking_enabled": user.get("background_tracking_enabled", False),
        "streak": streak
    }
@router.post("/report/generate")
async def generate_manual_report(
    current_user: dict = Depends(get_current_user)
):
    """Manually trigger an emotional synthesis report"""
    user_id = current_user["sub"]
    from app.services.report_service import report_service
    
    report = await report_service.generate_daily_report(user_id)
    return report
