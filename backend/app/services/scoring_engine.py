from datetime import datetime, timedelta
from typing import Dict, List
from collections import defaultdict
import statistics
import logging

logger = logging.getLogger(__name__)


class EmotionalScoringEngine:
    """
    Generates daily emotional wellness scores and metrics.
    """
    
    def __init__(self):
        self.emotion_health_map = {
            "joy": {"health": 100, "category": "positive"},
            "calm": {"health": 90, "category": "positive"},
            "contentment": {"health": 85, "category": "positive"},
            "gratitude": {"health": 95, "category": "positive"},
            "pride": {"health": 80, "category": "positive"},
            
            "sadness": {"health": 20, "category": "negative"},
            "anxiety": {"health": 15, "category": "negative"},
            "stress": {"health": 10, "category": "negative"},
            "frustration": {"health": 25, "category": "negative"},
            "anger": {"health": 20, "category": "negative"},
            "fear": {"health": 10, "category": "negative"},
            "burnout": {"health": 5, "category": "negative"},
            "loneliness": {"health": 25, "category": "negative"},
            "fatigue": {"health": 30, "category": "negative"},
        }
    
    def calculate_wellness_score(
        self,
        emotional_events: List[Dict],
        escalation_score: float,
        recovery_sessions: int = 0
    ) -> float:
        """
        Calculate emotional wellness score (0-100).
        
        Factors:
        - Emotional event health values
        - Event recency and intensity
        - Escalation level
        - Recovery activities
        """
        if not emotional_events:
            return 50.0  # Neutral baseline
        
        now = datetime.utcnow()
        weighted_health = 0.0
        total_weight = 0.0
        
        for event in emotional_events:
            emotion = event.get("emotion", "").lower()
            intensity = event.get("intensity", 0.5)
            
            # Get emotion health value
            health_info = self.emotion_health_map.get(emotion, {"health": 50, "category": "neutral"})
            base_health = health_info["health"]
            
            # Apply intensity modifier
            event_health = base_health * intensity
            
            # Apply recency weight
            age = (now - event.get("timestamp", now)).total_seconds()
            recency_weight = max(0.1, 1.0 - (age / 86400))  # Decay over 24 hours
            
            weighted_health += event_health * recency_weight
            total_weight += recency_weight
        
        if total_weight == 0:
            return 50.0
        
        base_score = weighted_health / total_weight
        
        # Apply escalation penalty
        escalation_penalty = escalation_score * 30
        score = max(0.0, min(100.0, base_score - escalation_penalty))
        
        # Apply recovery bonus
        recovery_bonus = min(10.0, recovery_sessions * 2.5)
        score = max(0.0, min(100.0, score + recovery_bonus))
        
        return round(score, 2)
    
    def calculate_stability_score(
        self,
        emotional_events: List[Dict]
    ) -> float:
        """
        Calculate emotional stability score (0-100).
        
        Based on emotional volatility and consistency.
        """
        if not emotional_events:
            return 50.0
        
        intensities = [e.get("intensity", 0.5) for e in emotional_events]
        
        if len(intensities) < 2:
            return 75.0  # Assume stable with few events
        
        # Calculate variance/volatility
        mean_intensity = statistics.mean(intensities)
        variance = statistics.variance(intensities)
        std_dev = statistics.stdev(intensities)
        
        # Lower volatility = higher stability
        # Map std_dev to 0-100 scale
        stability_score = max(0.0, 100.0 - (std_dev * 100))
        
        return round(stability_score, 2)
    
    def calculate_recovery_index(
        self,
        intervention_logs: List[Dict],
        recovery_sessions: List[Dict]
    ) -> float:
        """
        Calculate recovery index (0-100).
        
        Based on effectiveness of interventions and recovery activities.
        """
        if not intervention_logs and not recovery_sessions:
            return 50.0
        
        total_effectiveness = 0.0
        count = 0
        
        # Analyze intervention effectiveness
        for log in intervention_logs:
            if log.get("effectiveness"):
                total_effectiveness += log["effectiveness"]
                count += 1
        
        # Recovery sessions add to effectiveness
        for session in recovery_sessions:
            total_effectiveness += 70.0  # Base recovery session effectiveness
            count += 1
        
        if count == 0:
            return 50.0
        
        recovery_index = total_effectiveness / count
        return round(min(100.0, recovery_index), 2)
    
    def calculate_stress_exposure_score(
        self,
        emotional_events: List[Dict],
        escalation_score: float
    ) -> float:
        """
        Calculate stress exposure score (0-100).
        
        Based on frequency and intensity of negative emotions.
        """
        stress_emotions = {"stress", "anxiety", "burnout", "fatigue", "anger", "fear"}
        stress_events = [
            e for e in emotional_events
            if e.get("emotion", "").lower() in stress_emotions
        ]
        
        if not stress_events:
            return 0.0
        
        # Calculate stress load
        stress_load = sum(e.get("intensity", 0.5) for e in stress_events)
        stress_load = stress_load / max(1, len(emotional_events))
        
        # Combine with escalation score
        exposure_score = (stress_load * 60 + escalation_score * 40)
        
        return round(min(100.0, exposure_score), 2)
    
    def generate_daily_score(
        self,
        user_id: str,
        emotional_events: List[Dict],
        interventions: List[Dict] = None,
        recovery_sessions: List[Dict] = None,
        escalation_score: float = 0.0
    ) -> Dict:
        """Generate comprehensive daily emotional wellness score"""
        
        interventions = interventions or []
        recovery_sessions = recovery_sessions or []
        
        wellness_score = self.calculate_wellness_score(
            emotional_events,
            escalation_score,
            len(recovery_sessions)
        )
        
        stability_score = self.calculate_stability_score(emotional_events)
        recovery_index = self.calculate_recovery_index(interventions, recovery_sessions)
        stress_exposure = self.calculate_stress_exposure_score(
            emotional_events,
            escalation_score
        )
        
        return {
            "user_id": user_id,
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "emotional_wellness_score": wellness_score,
            "stability_score": stability_score,
            "recovery_index": recovery_index,
            "stress_exposure_score": stress_exposure,
            "overall_health": round(
                (wellness_score + stability_score + recovery_index - stress_exposure) / 3,
                2
            ),
            "events_count": len(emotional_events),
            "interventions_count": len(interventions),
            "recovery_sessions_count": len(recovery_sessions),
            "escalation_level": "critical" if escalation_score >= 0.85 else "escalating" if escalation_score >= 0.7 else "normal"
        }


# Global instance
scoring_engine = EmotionalScoringEngine()
