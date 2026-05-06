import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from collections import defaultdict
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmotionalTrackingEngine:
    """
    Core innovation: Realtime emotional tracking engine
    
    Monitors emotional events continuously and detects escalation patterns.
    """
    
    def __init__(self):
        # In-memory storage for real-time tracking
        # user_id -> emotional_events
        self.emotional_events: Dict[str, List[Dict]] = defaultdict(list)
        
        # user_id -> escalation_scores
        self.escalation_scores: Dict[str, float] = defaultdict(float)
        
        # Emotion weights for escalation calculation
        self.emotion_weights = {
            "sadness": 1.0,
            "stress": 1.2,
            "anxiety": 1.1,
            "frustration": 1.0,
            "loneliness": 0.9,
            "burnout": 1.3,
            "fatigue": 0.8,
            "anger": 1.1,
            "fear": 1.2,
            "joy": -0.5,
            "calm": -0.3,
        }
    
    def add_emotion_event(
        self,
        user_id: str,
        emotion: str,
        intensity: float,
        source: str,
        context: Optional[str] = None
    ) -> Dict:
        """Add an emotion event to the tracking system"""
        now = datetime.utcnow()
        event = {
            "emotion": emotion.lower(),
            "intensity": max(0.0, min(1.0, intensity)),  # Clamp to 0-1
            "source": source,
            "context": context,
            "timestamp": now,
            "weight": self._calculate_emotion_weight(emotion, intensity)
        }
        
        self.emotional_events[user_id].append(event)
        
        # Clean old events outside the window
        self._clean_old_events(user_id)
        
        # Update escalation score
        escalation = self._calculate_escalation(user_id)
        self.escalation_scores[user_id] = escalation
        
        return {
            "event_added": True,
            "escalation_score": escalation,
            "is_critical": escalation >= settings.CRITICAL_THRESHOLD
        }
    
    def _calculate_emotion_weight(self, emotion: str, intensity: float) -> float:
        """Calculate weighted importance of emotion"""
        base_weight = self.emotion_weights.get(emotion.lower(), 1.0)
        return base_weight * intensity
    
    def _clean_old_events(self, user_id: str, window_size: int = None):
        """Remove events outside the tracking window"""
        if window_size is None:
            window_size = settings.WINDOW_SIZE
        
        cutoff_time = datetime.utcnow() - timedelta(seconds=window_size)
        
        self.emotional_events[user_id] = [
            event for event in self.emotional_events[user_id]
            if event["timestamp"] > cutoff_time
        ]
    
    def _calculate_escalation(self, user_id: str) -> float:
        """
        Calculate escalation score (0-1)
        
        Uses weighted sum of recent emotions with recency bias.
        Higher score = more escalation.
        """
        events = self.emotional_events.get(user_id, [])
        
        if not events:
            return 0.0
        
        now = datetime.utcnow()
        total_weight = 0.0
        weighted_sum = 0.0
        
        for event in events:
            # Recency bias: Recent events carry more weight
            age_seconds = (now - event["timestamp"]).total_seconds()
            recency_factor = max(0.1, 1.0 - (age_seconds / settings.WINDOW_SIZE))
            
            weight = event["weight"] * recency_factor
            total_weight += weight
            
            # Negative emotions increase score, positive emotions decrease it
            if event["weight"] > 0:  # Negative/stressful emotions
                weighted_sum += weight
            else:  # Positive/calming emotions
                weighted_sum -= abs(weight) * 0.5
        
        if total_weight == 0:
            return 0.0
        
        escalation_score = weighted_sum / (total_weight * 2)  # Normalize
        return max(0.0, min(1.0, escalation_score))
    
    def detect_escalation_patterns(self, user_id: str) -> Dict:
        """Detect if user is in escalation state"""
        events = self.emotional_events.get(user_id, [])
        escalation = self.escalation_scores.get(user_id, 0.0)
        
        if not events:
            return {
                "is_escalating": False,
                "escalation_level": "normal",
                "escalation_score": 0.0,
                "trigger_emotions": []
            }
        
        # Analyze recent emotions (last 10 minutes)
        recent_cutoff = datetime.utcnow() - timedelta(minutes=10)
        recent_events = [e for e in events if e["timestamp"] > recent_cutoff]
        
        # Find predominant negative emotions
        negative_emotions = defaultdict(int)
        for event in recent_events:
            if event["weight"] > 0:
                negative_emotions[event["emotion"]] += 1
        
        trigger_emotions = sorted(
            negative_emotions.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Determine escalation level
        if escalation >= settings.CRITICAL_THRESHOLD:
            escalation_level = "critical"
        elif escalation >= settings.ESCALATION_THRESHOLD:
            escalation_level = "escalating"
        else:
            escalation_level = "normal"
        
        return {
            "is_escalating": escalation >= settings.ESCALATION_THRESHOLD,
            "escalation_level": escalation_level,
            "escalation_score": escalation,
            "trigger_emotions": [e[0] for e in trigger_emotions],
            "event_frequency": len(recent_events),
            "critical": escalation >= settings.CRITICAL_THRESHOLD
        }
    
    def get_emotional_stats(self, user_id: str, hours: int = 24) -> Dict:
        """Get emotional statistics for a user"""
        events = self.emotional_events.get(user_id, [])
        
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        relevant_events = [e for e in events if e["timestamp"] > cutoff_time]
        
        if not relevant_events:
            return {
                "total_events": 0,
                "dominant_emotions": [],
                "average_intensity": 0.0,
                "emotional_volatility": 0.0
            }
        
        # Calculate stats
        emotions_count = defaultdict(int)
        emotions_intensity = defaultdict(list)
        
        for event in relevant_events:
            emotions_count[event["emotion"]] += 1
            emotions_intensity[event["emotion"]].append(event["intensity"])
        
        # Find dominant emotions
        dominant = sorted(
            emotions_count.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        # Calculate average intensity
        all_intensities = [e["intensity"] for e in relevant_events]
        avg_intensity = sum(all_intensities) / len(all_intensities)
        
        # Calculate emotional volatility (standard deviation)
        import statistics
        volatility = statistics.stdev(all_intensities) if len(all_intensities) > 1 else 0.0
        
        return {
            "total_events": len(relevant_events),
            "dominant_emotions": [{"emotion": e[0], "count": e[1]} for e in dominant],
            "average_intensity": avg_intensity,
            "emotional_volatility": volatility,
            "time_period_hours": hours
        }
    
    def reset_user_tracking(self, user_id: str):
        """Reset tracking for a user (after recovery session)"""
        if user_id in self.emotional_events:
            self.emotional_events[user_id] = []
        if user_id in self.escalation_scores:
            self.escalation_scores[user_id] = 0.0
        
        return {"reset": True}


# Global instance
emotional_tracking_engine = EmotionalTrackingEngine()
