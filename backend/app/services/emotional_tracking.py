import statistics
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import defaultdict

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmotionalTrackingEngine:
    """
    Realtime Emotional Intelligence Engine

    Features:
    - Realtime emotional tracking
    - Emotional escalation detection
    - Emotional wellness scoring
    - Emotional stability analysis
    - Adaptive intervention triggering
    - Emotional recovery tracking
    """

    def __init__(self):

        # user_id -> emotional events
        self.emotional_events: Dict[str, List[Dict]] = defaultdict(list)

        # user_id -> escalation score
        self.escalation_scores: Dict[str, float] = defaultdict(float)

        # user_id -> wellness score
        self.wellness_scores: Dict[str, float] = defaultdict(float)

        # Emotion configuration
        self.emotion_config = {

            # Negative emotions
            "sadness": {
                "weight": 1.2,
                "type": "negative"
            },

            "anxiety": {
                "weight": 1.3,
                "type": "negative"
            },

            "stress": {
                "weight": 1.2,
                "type": "negative"
            },

            "burnout": {
                "weight": 1.5,
                "type": "negative"
            },

            "anger": {
                "weight": 1.4,
                "type": "negative"
            },

            "fear": {
                "weight": 1.3,
                "type": "negative"
            },

            "frustration": {
                "weight": 1.1,
                "type": "negative"
            },

            "loneliness": {
                "weight": 1.1,
                "type": "negative"
            },

            "fatigue": {
                "weight": 0.9,
                "type": "negative"
            },

            "overthinking": {
                "weight": 1.2,
                "type": "negative"
            },

            # Positive emotions
            "joy": {
                "weight": -0.8,
                "type": "positive"
            },

            "calm": {
                "weight": -0.7,
                "type": "positive"
            },

            "relief": {
                "weight": -0.6,
                "type": "positive"
            },

            "motivation": {
                "weight": -0.5,
                "type": "positive"
            },

            "hope": {
                "weight": -0.5,
                "type": "positive"
            },

            "gratitude": {
                "weight": -0.6,
                "type": "positive"
            },

            "confidence": {
                "weight": -0.4,
                "type": "positive"
            }
        }

    def add_emotion_event(
        self,
        user_id: str,
        emotion: str,
        intensity: float,
        source: str,
        context: Optional[str] = None
    ) -> Dict:

        emotion = emotion.lower()

        if emotion not in self.emotion_config:
            emotion = "stress"

        now = datetime.utcnow()

        event = {
            "emotion": emotion,
            "intensity": max(0.0, min(1.0, intensity)),
            "source": source,
            "context": context,
            "timestamp": now,
            "weight": self._calculate_weight(emotion, intensity)
        }

        self.emotional_events[user_id].append(event)

        self._clean_old_events(user_id)

        escalation_score = self._calculate_escalation(user_id)
        wellness_score = self._calculate_wellness_score(user_id)

        self.escalation_scores[user_id] = escalation_score
        self.wellness_scores[user_id] = wellness_score

        escalation_data = self.detect_escalation_patterns(user_id)

        return {
            "success": True,
            "emotion": emotion,
            "escalation_score": escalation_score,
            "wellness_score": wellness_score,
            "stability_score": self.calculate_stability_score(user_id),
            "intervention_required": escalation_data["critical"],
            "recommended_intervention": self.get_intervention(user_id),
            "dominant_emotion": self.get_dominant_emotion(user_id)
        }

    def _calculate_weight(self, emotion: str, intensity: float) -> float:

        config = self.emotion_config.get(emotion)

        if not config:
            return intensity

        return config["weight"] * intensity

    def _clean_old_events(self, user_id: str):

        cutoff_time = datetime.utcnow() - timedelta(
            minutes=settings.EMOTIONAL_WINDOW_MINUTES
        )

        self.emotional_events[user_id] = [
            event for event in self.emotional_events[user_id]
            if event["timestamp"] > cutoff_time
        ]

    def _calculate_escalation(self, user_id: str) -> float:

        events = self.emotional_events.get(user_id, [])

        if not events:
            return 0.0

        now = datetime.utcnow()

        weighted_sum = 0.0
        total_weight = 0.0

        for event in events:

            age_minutes = (
                now - event["timestamp"]
            ).total_seconds() / 60

            recency_factor = max(
                0.2,
                1 - (age_minutes / settings.EMOTIONAL_WINDOW_MINUTES)
            )

            adjusted_weight = event["weight"] * recency_factor

            weighted_sum += adjusted_weight
            total_weight += abs(adjusted_weight)

        if total_weight == 0:
            return 0.0

        score = weighted_sum / total_weight

        normalized = (score + 1) / 2

        return max(0.0, min(1.0, normalized))

    def _calculate_wellness_score(self, user_id: str) -> float:

        escalation = self.escalation_scores.get(user_id, 0.0)

        wellness = 100 - (escalation * 100)

        return round(max(0, min(100, wellness)), 2)

    def calculate_stability_score(self, user_id: str) -> float:

        events = self.emotional_events.get(user_id, [])

        if len(events) < 2:
            return 100.0

        intensities = [e["intensity"] for e in events]

        volatility = statistics.stdev(intensities)

        stability = max(0, 100 - (volatility * 100))

        return round(stability, 2)

    def detect_escalation_patterns(self, user_id: str) -> Dict:

        escalation_score = self.escalation_scores.get(user_id, 0.0)

        if escalation_score >= 0.8:
            level = "critical"

        elif escalation_score >= 0.6:
            level = "high"

        elif escalation_score >= 0.4:
            level = "moderate"

        else:
            level = "normal"

        return {
            "escalation_level": level,
            "critical": escalation_score >= 0.8,
            "score": escalation_score
        }

    def get_dominant_emotion(self, user_id: str) -> Optional[str]:

        events = self.emotional_events.get(user_id, [])

        if not events:
            return None

        emotion_count = defaultdict(int)

        for event in events:
            emotion_count[event["emotion"]] += 1

        return max(emotion_count, key=emotion_count.get)

    def get_intervention(self, user_id: str) -> Dict:
        dominant_emotion = self.get_dominant_emotion(user_id)
        if not dominant_emotion:
            return {
                "type": "general",
                "message": "Take a mindful pause.",
                "activity": "breathing",
                "video_url": "https://www.youtube.com/watch?v=mgmVOuLgFB0"
            }

        from app.services.video_service import video_service
        video_url = video_service.get_video_for_emotion(dominant_emotion)

        interventions = {
            "stress": {
                "type": "breathing",
                "message": "Take a slow breathing break.",
                "activity": "4-7-8 breathing",
                "video_url": video_url
            },
            "anxiety": {
                "type": "grounding",
                "message": "Let's calm your thoughts slowly.",
                "activity": "5-4-3-2-1 grounding",
                "video_url": video_url
            },
            "sadness": {
                "type": "support",
                "message": "You may need a calming reset.",
                "activity": "comfort playlist",
                "video_url": video_url
            },
            "anger": {
                "type": "cooldown",
                "message": "Pause and release tension.",
                "activity": "calm music",
                "video_url": video_url
            },
            "burnout": {
                "type": "recovery",
                "message": "Your mind needs recovery.",
                "activity": "mindful break",
                "video_url": video_url
            }
        }

        return interventions.get(
            dominant_emotion,
            {
                "type": "general",
                "message": "Take a mindful pause.",
                "activity": "breathing",
                "video_url": video_url
            }
        )

    def get_emotional_stats(self, user_id: str) -> Dict:

        events = self.emotional_events.get(user_id, [])

        if not events:
            return {}

        emotion_count = defaultdict(int)

        for event in events:
            emotion_count[event["emotion"]] += 1

        dominant = sorted(
            emotion_count.items(),
            key=lambda x: x[1],
            reverse=True
        )

        return {
            "total_events": len(events),
            "dominant_emotions": dominant[:5],
            "wellness_score": self.wellness_scores.get(user_id, 100),
            "stability_score": self.calculate_stability_score(user_id),
            "escalation_score": self.escalation_scores.get(user_id, 0),
            "dominant_emotion": self.get_dominant_emotion(user_id)
        }

    def reset_user_tracking(self, user_id: str):

        self.emotional_events[user_id] = []
        self.escalation_scores[user_id] = 0.0
        self.wellness_scores[user_id] = 100.0

        return {
            "success": True,
            "message": "Tracking reset completed"
        }


# Global instance
emotional_tracking_engine = EmotionalTrackingEngine()