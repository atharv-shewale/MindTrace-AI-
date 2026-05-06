import random
from datetime import datetime, timedelta
from app.core.database import get_database
from app.ai.emotion_detector import emotion_engine

async def seed_mock_data(user_id: str):
    """Generates 7 days of mock journal entries and emotion events for a user."""
    db = get_database()
    
    # Clear existing mock data for this user to avoid duplicates if re-run
    # (Optional: await db.journal_entries.delete_many({"user_id": user_id, "is_mock": True}))

    emotions = ["joy", "neutral", "sadness", "anger", "fear", "surprise"]
    journal_templates = [
        "Today was a productive day. I managed to finish most of my tasks and felt a great sense of accomplishment.",
        "Feeling a bit overwhelmed with work lately. Need to take a break and focus on my mental health.",
        "Had a wonderful walk in the park. Nature always helps me feel more grounded and peaceful.",
        "I'm feeling quite anxious about the upcoming presentation. Hope everything goes well.",
        "Spent the evening reading a book. It was very relaxing and helped me disconnect from the world.",
        "Had a small argument with a friend. Feeling a bit down and reflective about our conversation.",
        "Woke up feeling refreshed and ready to take on the day! The sun is shining and I'm happy."
    ]

    for i in range(7):
        target_date = datetime.utcnow() - timedelta(days=i)
        
        # 1. Generate Journal Entry
        content = journal_templates[i % len(journal_templates)]
        analysis = await emotion_engine.analyze_text_comprehensive(content)
        
        entry_doc = {
            "user_id": user_id,
            "content": content,
            "emotions_detected": analysis["emotions"],
            "dominant_emotion": analysis["dominant_emotion"],
            "dominant_intensity": analysis["dominant_intensity"],
            "sentiment": analysis["sentiment"],
            "positivity": analysis["positivity"],
            "created_at": target_date,
            "is_mock": True
        }
        await db.journal_entries.insert_one(entry_doc)

        # 2. Generate multiple emotion events per day for the "Spectrum"
        for _ in range(random.randint(2, 5)):
            event_time = target_date - timedelta(hours=random.randint(1, 23))
            emotion = random.choice(emotions)
            intensity = random.uniform(0.4, 0.9)
            
            event_doc = {
                "user_id": user_id,
                "emotion": emotion,
                "intensity": intensity,
                "source": "sensor_mock",
                "timestamp": event_time,
                "is_mock": True
            }
            await db.realtime_emotion_events.insert_one(event_doc)

    return {"status": "success", "message": f"Generated 7 days of history for user {user_id}"}
