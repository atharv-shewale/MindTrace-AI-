import asyncio
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from app.ai.emotion_detector import emotion_engine

async def test_emotion_detection():
    print("Testing Emotion Detection Engine...")
    test_texts = [
        "I am so happy today! Everything is going great.",
        "I feel very sad and lonely.",
        "I am so angry right now, I could scream!",
        "I'm a bit nervous about the upcoming presentation.",
        "Just a normal day, nothing special."
    ]
    
    await emotion_engine.initialize()
    
    for text in test_texts:
        print(f"\nText: {text}")
        analysis = await emotion_engine.analyze_text_comprehensive(text)
        print(f"Dominant Emotion: {analysis['dominant_emotion']} ({analysis['dominant_intensity']:.2f})")
        print(f"Positivity: {analysis['positivity']:.2f}")
        print(f"Emotions: {analysis['emotions']}")

if __name__ == "__main__":
    asyncio.run(test_emotion_detection())
