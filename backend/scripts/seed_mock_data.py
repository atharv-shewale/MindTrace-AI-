import asyncio
import os
import sys
from datetime import datetime, timedelta
import random
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

async def seed_data():
    print("Seeding MindTrace AI+ with 7 days of mock data...")
    
    mongodb_url = os.getenv("MONGODB_URL")
    mongodb_db = os.getenv("MONGODB_DB", "mindtrace_db")
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[mongodb_db]
    
    # We'll seed for a generic test user or all users if needed
    # Better to find a user first
    user = await db.users.find_one({})
    if not user:
        print("No user found. Please sign up first.")
        return
    
    user_id = str(user["_id"])
    print(f"Seeding data for user: {user.get('email', 'unknown')} ({user_id})")
    
    # Clear existing data for this user for a fresh start (optional)
    # await db.journal_entries.delete_many({"user_id": user_id})
    # await db.realtime_emotion_events.delete_many({"user_id": user_id})
    
    emotions = ["joy", "sadness", "anger", "fear", "surprise", "neutral", "disgust"]
    journal_topics = [
        "Thinking about my future and career goals.",
        "Feeling a bit overwhelmed with the project deadline.",
        "Had a great morning walk today, felt very refreshed.",
        "Frustrated with the slow progress on the backend.",
        "Surprised by a nice call from an old friend.",
        "Just a regular day, nothing much happened.",
        "Enjoying some quiet time with a book."
    ]
    
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=i)
        
        # 1. Seed Journal Entries
        dominant_emotion = random.choice(emotions)
        journal_entry = {
            "user_id": user_id,
            "content": f"Day {7-i} Journal: {random.choice(journal_topics)}",
            "emotions_detected": {e: random.uniform(0.1, 0.4) for e in emotions},
            "dominant_emotion": dominant_emotion,
            "dominant_intensity": random.uniform(0.6, 0.9),
            "positivity": random.uniform(0.3, 0.8),
            "created_at": date,
            "updated_at": date
        }
        journal_entry["emotions_detected"][dominant_emotion] = journal_entry["dominant_intensity"]
        await db.journal_entries.insert_one(journal_entry)
        
        # 2. Seed Emotion Events
        for _ in range(5): # 5 events per day
            event_time = date - timedelta(hours=random.randint(1, 23))
            event_emotion = random.choice(emotions)
            event = {
                "user_id": user_id,
                "emotion": event_emotion,
                "intensity": random.uniform(0.4, 0.8),
                "source": random.choice(["sensor", "manual", "chat"]),
                "timestamp": event_time
            }
            await db.realtime_emotion_events.insert_one(event)

    print("Successfully seeded 7 days of data.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
