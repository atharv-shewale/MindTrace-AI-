from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
from datetime import datetime
from app.core.security import get_current_user
from app.core.database import get_database
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class SimpleEmotionalChatbot:
    """Basic emotional support chatbot (non-medical)"""
    
    def __init__(self):
        self.support_responses = {
            "sadness": [
                "I hear that you're feeling sad. That's a valid emotion. Would you like to talk about what's on your mind?",
                "Sadness is a natural part of life. What might help you feel a bit better right now?",
                "It's okay to feel sad. You're not alone in this journey."
            ],
            "anxiety": [
                "I sense some anxiety. Grounding exercises can help. Try the 5-4-3-2-1 technique.",
                "Anxiety is your mind trying to protect you. Let's focus on what you can control right now.",
                "Take a deep breath. You're safe. What's one small thing you can do right now?"
            ],
            "stress": [
                "You seem stressed. Remember that stress is temporary and manageable.",
                "Breaking things into smaller steps can help with stress. What's one small thing we can tackle?",
                "Your wellbeing matters. Let's find a calm moment together."
            ],
            "loneliness": [
                "Feeling lonely is real, and you're brave for acknowledging it.",
                "Connection is healing. Would reaching out to someone help right now?",
                "You matter, and your feelings are valid. I'm here to listen."
            ],
            "default": [
                "I'm here to support you. How are you feeling right now?",
                "Your emotional wellbeing is important. Would you like to share what's on your mind?",
                "Remember, all feelings are temporary. What can I help you with?"
            ]
        }
    
    def get_support_response(self, emotion: Optional[str]) -> str:
        """Get supportive response based on emotion"""
        import random
        emotion_key = emotion.lower() if emotion else "default"
        responses = self.support_responses.get(emotion_key, self.support_responses["default"])
        return random.choice(responses)


chatbot = SimpleEmotionalChatbot()


@router.post("/send-message")
async def send_message(
    message: str,
    context_emotion: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Send a message to the emotional support chatbot"""
    user_id = current_user["sub"]
    db = get_database()
    
    # Store user message
    user_msg_doc = {
        "user_id": user_id,
        "sender": "user",
        "message": message,
        "emotional_context": {"emotion": context_emotion} if context_emotion else None,
        "timestamp": datetime.utcnow()
    }
    
    await db.chatbot_messages.insert_one(user_msg_doc)
    
    # Generate bot response
    bot_response = chatbot.get_support_response(context_emotion)
    
    # Store bot message
    bot_msg_doc = {
        "user_id": user_id,
        "sender": "bot",
        "message": bot_response,
        "emotional_context": None,
        "timestamp": datetime.utcnow()
    }
    
    result = await db.chatbot_messages.insert_one(bot_msg_doc)
    
    return {
        "response": bot_response,
        "message_id": str(result.inserted_id),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/conversation-history")
async def get_conversation_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get chatbot conversation history"""
    user_id = current_user["sub"]
    db = get_database()
    
    messages = await db.chatbot_messages.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(limit).to_list(None)
    
    # Reverse to show chronological order
    messages.reverse()
    
    for msg in messages:
        msg["_id"] = str(msg["_id"])
    
    return {
        "messages": messages,
        "count": len(messages)
    }


@router.post("/reset-conversation")
async def reset_conversation(
    current_user: dict = Depends(get_current_user)
):
    """Clear conversation history"""
    user_id = current_user["sub"]
    db = get_database()
    
    result = await db.chatbot_messages.delete_many({"user_id": user_id})
    
    return {
        "cleared": True,
        "messages_deleted": result.deleted_count
    }


@router.get("/emotional-support-tips")
async def get_support_tips(
    emotion: Optional[str] = None
):
    """Get general emotional support tips"""
    tips = {
        "sadness": [
            "Allow yourself to feel sad - it's a valid emotion",
            "Reach out to someone you trust",
            "Engage in activities that bring small moments of joy",
            "Practice self-compassion"
        ],
        "anxiety": [
            "Practice deep breathing exercises",
            "Ground yourself using the 5-4-3-2-1 technique",
            "Limit caffeine and get enough sleep",
            "Physical activity can help reduce anxiety"
        ],
        "stress": [
            "Break tasks into smaller, manageable steps",
            "Take regular breaks",
            "Practice mindfulness or meditation",
            "Set boundaries to protect your time"
        ],
        "general": [
            "Your emotions are valid and temporary",
            "Self-care is not selfish - it's necessary",
            "Connection with others helps",
            "Progress over perfection"
        ]
    }
    
    selected_tips = tips.get(emotion, tips["general"]) if emotion else tips["general"]
    
    return {
        "tips": selected_tips,
        "emotion": emotion or "general"
    }
