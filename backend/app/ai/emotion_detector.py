import asyncio
import httpx
import logging
from typing import Dict, List, Optional
from datetime import datetime
from app.services.groq_service import groq_service
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmotionDetectionEngine:
    def __init__(self):
        self.api_token = settings.HUGGINGFACE_TOKEN
        self.emotion_url = f"https://api-inference.huggingface.co/models/{settings.EMOTION_MODEL}"
        self.sentiment_url = f"https://api-inference.huggingface.co/models/{settings.SENTIMENT_MODEL}"
        self.face_emotion_url = "https://api-inference.huggingface.co/models/dima806/facial_emotions_image_detection"
        self._initialized = False
        self._cache = {} 
    
    async def initialize(self):
        self._initialized = True
        logger.info("✓ Emotion Detection Engine initialized")

    async def _call_hf_api(self, url: str, text: str) -> Optional[List[Dict]]:
        if not self.api_token:
            return None
        
        headers = {"Authorization": f"Bearer {self.api_token}"}
        try:
            async with httpx.AsyncClient() as client:
                # Fixed URL structure if needed, but keeping it as is for now and prioritizing Groq
                response = await client.post(url, headers=headers, json={"inputs": text}, timeout=10.0)
            
            if response.status_code == 200:
                data = response.json()
                return data[0] if isinstance(data, list) and isinstance(data[0], list) else data
            return None
        except Exception as e:
            logger.error(f"HF API Error: {e}")
            return None

    async def detect_emotions_groq(self, text: str) -> Dict[str, float]:
        """Detect emotions using Groq (Llama 3) for high accuracy"""
        if not groq_service.client:
            return {}
        
        try:
            prompt = (
                f"Analyze the emotions in this text: \"{text}\". "
                "Return only a valid JSON object with emotions as keys (joy, sadness, anger, fear, surprise, neutral) "
                "and their intensities (0.0 to 1.0) as values. No other text."
            )
            chat_completion = groq_service.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-8b-8192",
                max_tokens=100,
                response_format={"type": "json_object"}
            )
            import json
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            logger.error(f"Groq Emotion Detection Error: {e}")
            return {}

    async def analyze_text_comprehensive(self, text: str) -> Dict:
        """Comprehensive analysis using Groq for superior insights"""
        text_clean = text.strip().lower()
        if text_clean in self._cache:
            result = self._cache[text_clean].copy()
            result["timestamp"] = datetime.now().isoformat()
            result["cached"] = True
            return result

        # Prioritize Groq for detection
        emotions = await self.detect_emotions_groq(text)
        
        # Fallback to HF then keywords if Groq fails
        if not emotions:
            hf_results = await self._call_hf_api(self.emotion_url, text)
            if hf_results:
                emotions = {r['label'].lower(): r['score'] for r in hf_results}
            else:
                emotions = self._fallback_emotions(text)
        
        dominant_emotion = max(emotions, key=emotions.get) if emotions else "neutral"
        dominant_intensity = emotions.get(dominant_emotion, 0)
        
        # Calculate positivity based on emotions
        positivity = emotions.get("joy", 0) * 1.2 + emotions.get("surprise", 0) * 0.5 - emotions.get("sadness", 0) * 0.5 - emotions.get("anger", 0) * 0.8
        positivity = max(0.0, min(1.0, (positivity + 1) / 2)) # Normalize to 0-1

        # Generate personalized suggestion via Groq
        suggestions = await groq_service.get_personalized_suggestions(dominant_emotion, dominant_intensity, positivity)
        insight = await groq_service.get_daily_quote(context=dominant_emotion)

        analysis_result = {
            "emotions": emotions,
            "dominant_emotion": dominant_emotion,
            "dominant_intensity": dominant_intensity,
            "positivity": positivity,
            "sentiment": {"positive": positivity, "neutral": 1-positivity if positivity < 0.5 else 0, "negative": 1-positivity if positivity >= 0.5 else 0},
            "suggestions": suggestions,
            "insight": insight,
            "timestamp": datetime.now().isoformat(),
            "cached": False,
            "embeddings": [0.0] * 384
        }
        
        if emotions:
            self._cache[text_clean] = analysis_result
            
        return analysis_result
    
    async def analyze_image(self, image_bytes: bytes) -> Dict:
        """Analyze face emotions from an image using Hugging Face Vision API"""
        if not self.api_token:
            logger.warning("Hugging Face token missing. Skipping vision analysis.")
            return {"dominant_emotion": "neutral", "dominant_intensity": 0.0, "emotions": {}}
        
        headers = {"Authorization": f"Bearer {self.api_token}"}
        try:
            logger.info(f"Sending image to HF Vision API: {self.face_emotion_url}")
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.face_emotion_url, 
                    headers=headers, 
                    content=image_bytes, 
                    timeout=20.0
                )
            
            if response.status_code == 200:
                results = response.json()
                logger.info(f"HF Vision API Success: {results}")
                if isinstance(results, list) and len(results) > 0:
                    # Handle both [{label: x, score: y}, ...] and [[{label: x, score: y}, ...]] formats
                    data = results[0] if isinstance(results[0], list) else results
                    emotions = {r['label'].lower(): r['score'] for r in data}
                    dominant_emotion = max(emotions, key=emotions.get)
                    dominant_intensity = emotions.get(dominant_emotion, 0)
                    
                    return {
                        "emotions": emotions,
                        "dominant_emotion": dominant_emotion,
                        "dominant_intensity": dominant_intensity,
                        "timestamp": datetime.now().isoformat()
                    }
            
            logger.error(f"HF Vision API Error ({response.status_code}): {response.text}")
            return {"dominant_emotion": "neutral", "dominant_intensity": 0.0, "emotions": {}, "error": response.text}
        except Exception as e:
            logger.error(f"Image analysis exception: {str(e)}")
            return {"dominant_emotion": "neutral", "dominant_intensity": 0.0, "emotions": {}, "error": str(e)}
    
    def _fallback_emotions(self, text: str) -> Dict[str, float]:
        text = text.lower()
        if "happy" in text or "great" in text: return {"joy": 0.8}
        if "sad" in text or "bad" in text: return {"sadness": 0.8}
        if "angry" in text or "mad" in text: return {"anger": 0.8}
        return {"neutral": 0.5}

emotion_engine = EmotionDetectionEngine()
