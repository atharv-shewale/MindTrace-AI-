import logging
from typing import List
from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger(__name__)

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = None
        if self.api_key:
            self.client = AsyncGroq(api_key=self.api_key)
        else:
            logger.warning("GROQ_API_KEY not found. GroqService will be limited.")

    async def get_daily_quote(self, context: str = "general") -> str:
        """Generate an impressive wellness quote using Groq"""
        if not self.client:
            return "Believe in yourself. Every day is a new beginning."
        
        try:
            prompt = f"Generate a short, impressive, and futuristic wellness quote related to {context} for a mind tracking app called MindTrace AI+. Keep it under 20 words."
            chat_completion = await self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                max_tokens=50,
            )
            return chat_completion.choices[0].message.content.strip().replace('"', '')
        except Exception as e:
            logger.error(f"Error generating quote with Groq: {e}")
            return "Your mind is your most powerful tool. Trace it well."

    async def get_personalized_suggestions(self, dominant_emotion: str, intensity: float, positivity: float) -> List[str]:
        """Generate personalized wellness suggestions based on emotional state"""
        if not self.client:
            return ["Practice mindful breathing.", "Stay hydrated.", "Take a short walk."]
        
        try:
            prompt = (
                f"Based on the following emotional state: dominant emotion: {dominant_emotion}, "
                f"intensity: {intensity*100}%, positivity: {positivity*100}%. "
                "Provide 3 personalized, actionable, and futuristic wellness suggestions for the MindTrace AI+ user. "
                "Return them as a simple list separated by newlines, no numbers."
            )
            chat_completion = await self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                max_tokens=150,
            )
            suggestions = chat_completion.choices[0].message.content.strip().split('\n')
            # Clean up and limit to 3
            return [s.strip('- ').strip() for s in suggestions if s.strip()][:3]
        except Exception as e:
            logger.error(f"Error generating suggestions with Groq: {e}")
            return ["Practice deep breathing for 5 minutes.", "Log your next positive interaction.", "Listen to calming frequency music."]

    async def get_ai_activities(self, user_data: dict, emotional_state: dict) -> List[dict]:
        """Generate highly personalized activities using Groq based on user profile and live emotions"""
        if not self.client:
            return [
                {"title": "Mindful Walk", "desc": "A quiet walk to clear your head.", "type": "activity"},
                {"title": "Creative Journaling", "desc": "Write down your thoughts.", "type": "activity"}
            ]
        
        try:
            interests = user_data.get("interests", [])
            age = user_data.get("age", "unknown")
            gender = user_data.get("gender", "unknown")
            dominant_emotion = emotional_state.get("dominant_emotion", "neutral")
            intensity = emotional_state.get("intensity", 0.5)
            escalation_level = emotional_state.get("escalation_level", "normal")
            
            interest_str = ", ".join(interests) if interests else "general wellness"
            
            prompt = (
                f"User Profile: Age {age}, Gender {gender}, Interests: {interest_str}. "
                f"Current Emotional State: Feeling {dominant_emotion} (intensity {intensity*100}%, state: {escalation_level}). "
                "Suggest 3 specific, unique, and highly personalized activities to help this user based on their specific interests and current mood. "
                "If they are stressed, suggest relaxing versions of their interests. If they are sad, suggest engaging versions. "
                "Format as JSON array of objects: [{\"title\": \"...\", \"desc\": \"...\", \"type\": \"...\"}] "
                "The 'type' should be one of: 'creative', 'physical', 'social', 'quiet', 'tech'. "
                "Only return the JSON list."
            )
            
            chat_completion = await self.client.chat.completions.create(
                messages=[{"role": "system", "content": "You are an advanced AI wellness coach for MindTrace AI+."},
                          {"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                max_tokens=400,
                response_format={"type": "json_object"}
            )
            
            import json
            content = chat_completion.choices[0].message.content
            data = json.loads(content)
            
            # Extract the list from potential root keys
            activities = []
            if isinstance(data, list):
                activities = data
            elif isinstance(data, dict):
                for key in data:
                    if isinstance(data[key], list):
                        activities = data[key]
                        break
            
            return activities[:3]
        except Exception as e:
            logger.error(f"Error generating AI activities: {e}")
            return [
                {"title": "Focused Breathing", "desc": "Regulate your nervous system.", "type": "quiet"},
                {"title": "Digital Detox", "desc": "Step away from screens for 15 minutes.", "type": "tech"}
            ]

    async def analyze_journal_sentiment(self, text: str) -> dict:
        """Perform high-accuracy sentiment and emotional analysis on journal text"""
        if not self.client:
            return {"dominant_emotion": "neutral", "intensity": 0.5, "suggestions": ["Record your thoughts more often."]}

        try:
            prompt = (
                f"Analyze the following journal entry for deep emotional patterns and underlying psychological states: \"{text}\". "
                "Identify the dominant emotion, the intensity (0-1), and provide 3 highly personalized wellness suggestions. "
                "Format as JSON: {\"dominant_emotion\": \"...\", \"intensity\": 0.0, \"suggestions\": [\"...\", \"...\", \"...\"]}"
            )
            chat_completion = await self.client.chat.completions.create(
                messages=[{"role": "system", "content": "You are an expert psychological analyzer for MindTrace AI+."},
                          {"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"}
            )
            import json
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error in Groq sentiment analysis: {e}")
            return {"dominant_emotion": "neutral", "intensity": 0.5, "suggestions": ["Continue journaling to build patterns."]}

    async def get_place_suggestions(self, dominant_emotion: str, intensity: float, interests: List[str]) -> List[str]:
        """Suggest decompression places based on mood and interests"""
        if not self.client:
            return ["A quiet park.", "A cozy library.", "A local cafe."]
            
        try:
            interest_str = ", ".join(interests) if interests else "nature and peace"
            prompt = (
                f"User feeling {dominant_emotion} (intensity {intensity*100}%). "
                f"Interests: {interest_str}. "
                "Suggest 3 specific types of places or activities where this user could decompress. "
                "Return them as a simple list separated by newlines."
            )
            chat_completion = await self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                max_tokens=100,
            )
            places = chat_completion.choices[0].message.content.strip().split('\n')
            return [p.strip('- ').strip() for p in places if p.strip()][:3]
        except Exception as e:
            logger.error(f"Error in Groq place suggestions: {e}")
            return ["A peaceful garden.", "A quiet museum.", "A scenic viewpoint."]

    async def _call_llm(self, system_message: str, user_message: str) -> str:
        """Generic helper for LLM chat completions"""
        if not self.client:
            return "I am processing your thoughts, but I need a moment to connect."
            
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message}
                ],
                model="llama-3.3-70b-versatile",
                max_tokens=250,
                temperature=0.7
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"LLM Call Error: {e}")
            return "I'm still here with you. Let's just breathe for a moment."

groq_service = GroqService()

