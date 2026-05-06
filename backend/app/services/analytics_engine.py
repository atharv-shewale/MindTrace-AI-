from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import statistics
import logging

logger = logging.getLogger(__name__)


class AnalyticsInsightsEngine:
    """
    Generates daily insights, trends, and actionable recommendations.
    """
    
    def __init__(self):
        self.insight_templates = {
            "calm_time": "You appear calmer after {activity}. Consider more of this activity.",
            "stress_trigger": "Late-night activity increases stress levels repeatedly.",
            "recovery_pattern": "You recover effectively through {recovery_method}.",
            "escalation_warning": "Your emotional escalation patterns suggest {recommendation}.",
            "positive_trend": "Your emotional stability has improved by {percent}%.",
            "concern": "We've noticed increased {emotion} recently. Consider reaching out or practicing self-care.",
        }
    
    def generate_daily_insights(
        self,
        user_id: str,
        daily_scores: Dict,
        emotional_events: List[Dict],
        wellness_history: List[Dict] = None
    ) -> List[str]:
        """Generate natural language insights for the user"""
        wellness_history = wellness_history or []
        insights = []
        
        # Insight 1: Emotional state summary
        wellness_score = daily_scores.get("emotional_wellness_score", 50)
        if wellness_score >= 80:
            insights.append("Great job today! Your emotional wellness is thriving.")
        elif wellness_score >= 60:
            insights.append("You're maintaining a balanced emotional state today.")
        elif wellness_score >= 40:
            insights.append("You're navigating some emotional challenges. It's okay to ask for support.")
        else:
            insights.append("Today has been emotionally challenging. Please prioritize self-care.")
        
        # Insight 2: Stability trend
        stability = daily_scores.get("stability_score", 50)
        if stability >= 75:
            insights.append("Your emotions have been quite stable today—a great foundation.")
        elif stability <= 35:
            insights.append("Your emotional state has fluctuated quite a bit. Grounding exercises might help.")
        
        # Insight 3: Recovery effectiveness
        recovery_index = daily_scores.get("recovery_index", 50)
        if recovery_index >= 75:
            insights.append("Your recovery activities are working well. Keep them up!")
        elif recovery_index < 40:
            insights.append("Consider trying new coping strategies—your current ones might need adjustment.")
        
        # Insight 4: Stress exposure
        stress_score = daily_scores.get("stress_exposure_score", 0)
        if stress_score >= 70:
            insights.append("You've experienced significant stress today. Prioritize relaxation tonight.")
        elif stress_score >= 40:
            insights.append("Moderate stress levels today. A breathing exercise might help you reset.")
        
        # Insight 5: Pattern detection from history
        if len(wellness_history) >= 7:
            historical_insights = self._analyze_historical_patterns(wellness_history)
            insights.extend(historical_insights)
        
        # Insight 6: Predominant emotions
        emotions_summary = self._summarize_emotions(emotional_events)
        if emotions_summary:
            insights.append(f"Your main emotional experience today: {emotions_summary}")
        
        return insights
    
    def _analyze_historical_patterns(self, wellness_history: List[Dict]) -> List[str]:
        """Analyze patterns in historical wellness data"""
        insights = []
        
        if len(wellness_history) < 2:
            return insights
        
        # Get last 7 days
        recent = wellness_history[-7:]
        
        # Calculate trend
        scores = [w.get("emotional_wellness_score", 50) for w in recent]
        if len(scores) >= 2:
            trend = scores[-1] - scores[0]
            trend_percent = abs(round(trend))
            
            if trend > 5:
                insights.append(f"✨ Positive trend: Your wellness has improved by {trend_percent} points!")
            elif trend < -5:
                insights.append(f"Your wellness has dipped by {abs(trend_percent)} points. Let's work on recovery.")
        
        # Identify best day
        best_day_idx = scores.index(max(scores)) if scores else 0
        best_score = scores[best_day_idx]
        insights.append(f"Your best day this week scored {best_score}. Let's aim for that again!")
        
        return insights
    
    def _summarize_emotions(self, emotional_events: List[Dict]) -> str:
        """Create a summary of emotions experienced"""
        if not emotional_events:
            return ""
        
        emotions_count = defaultdict(int)
        for event in emotional_events:
            emotion = event.get("emotion", "").lower()
            if emotion:
                emotions_count[emotion] += 1
        
        if not emotions_count:
            return ""
        
        top_emotions = sorted(
            emotions_count.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        emotion_names = [e[0] for e in top_emotions]
        
        if len(emotion_names) == 1:
            return f"{emotion_names[0]}"
        elif len(emotion_names) == 2:
            return f"{emotion_names[0]} and {emotion_names[1]}"
        else:
            return f"{emotion_names[0]}, {emotion_names[1]}, and {emotion_names[2]}"
    
    def identify_triggers(
        self,
        emotional_events: List[Dict],
        context_history: List[Dict]
    ) -> List[Dict]:
        """Identify emotional triggers from events and context"""
        triggers = defaultdict(lambda: {"frequency": 0, "avg_intensity": [], "contexts": []})
        
        for event in emotional_events:
            emotion = event.get("emotion", "").lower()
            intensity = event.get("intensity", 0.5)
            context = event.get("context", "")
            
            if emotion:
                triggers[emotion]["frequency"] += 1
                triggers[emotion]["avg_intensity"].append(intensity)
                if context:
                    triggers[emotion]["contexts"].append(context)
        
        # Process triggers
        result = []
        for emotion, data in triggers.items():
            avg_intensity = sum(data["avg_intensity"]) / len(data["avg_intensity"]) if data["avg_intensity"] else 0
            most_common_context = max(
                set(data["contexts"]),
                key=data["contexts"].count
            ) if data["contexts"] else None
            
            result.append({
                "emotion": emotion,
                "frequency": data["frequency"],
                "average_intensity": round(avg_intensity, 2),
                "primary_context": most_common_context,
                "recommendation": self._get_trigger_recommendation(emotion, most_common_context)
            })
        
        # Sort by frequency
        result.sort(key=lambda x: x["frequency"], reverse=True)
        return result
    
    def _get_trigger_recommendation(self, emotion: str, context: Optional[str]) -> str:
        """Get recommendations for identified triggers"""
        recommendations = {
            "stress": "Try to identify sources of stress and practice stress-relief techniques.",
            "anxiety": "Grounding exercises and breathing work well for anxiety management.",
            "sadness": "Consider connecting with supportive people or engaging in meaningful activities.",
            "frustration": "Take breaks when frustrated. Movement and breathwork help reset.",
            "burnout": "You need more rest and recovery. Consider a digital detox.",
            "loneliness": "Reach out to friends or family. Connection is powerful.",
        }
        
        base_recommendation = recommendations.get(emotion, "Practice self-compassion and self-care.")
        
        if context and "night" in context.lower():
            return f"{base_recommendation} Also, try winding down earlier."
        elif context and "work" in context.lower():
            return f"{base_recommendation} Consider work-life boundaries."
        
        return base_recommendation
    
    def generate_heatmap_data(
        self,
        emotional_events: List[Dict],
        period_days: int = 30
    ) -> Dict:
        """Generate data for emotional heatmap visualization"""
        heatmap = defaultdict(lambda: defaultdict(int))
        
        now = datetime.utcnow()
        for i in range(period_days):
            date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
            for emotion in ["joy", "calm", "sadness", "stress", "anxiety", "frustration"]:
                heatmap[date][emotion] = 0
        
        # Populate with actual events
        for event in emotional_events:
            date = event.get("timestamp", now).strftime("%Y-%m-%d")
            emotion = event.get("emotion", "").lower()
            intensity = event.get("intensity", 0.5)
            
            if date in heatmap and emotion in heatmap[date]:
                heatmap[date][emotion] += intensity
        
        return dict(heatmap)
    
    def generate_wellness_trajectory(
        self,
        daily_scores_history: List[Dict],
        period_days: int = 30
    ) -> Dict:
        """Generate wellness trajectory data for trending"""
        trajectory = {
            "dates": [],
            "wellness_scores": [],
            "stability_scores": [],
            "recovery_index": [],
            "stress_exposure": [],
            "trend": "stable"
        }
        
        if not daily_scores_history:
            return trajectory
        
        # Sort by date
        sorted_scores = sorted(
            daily_scores_history,
            key=lambda x: x.get("date", "")
        )[-period_days:]
        
        for score in sorted_scores:
            trajectory["dates"].append(score.get("date", ""))
            trajectory["wellness_scores"].append(score.get("emotional_wellness_score", 50))
            trajectory["stability_scores"].append(score.get("stability_score", 50))
            trajectory["recovery_index"].append(score.get("recovery_index", 50))
            trajectory["stress_exposure"].append(score.get("stress_exposure_score", 0))
        
        # Calculate trend
        if len(trajectory["wellness_scores"]) >= 7:
            early_avg = sum(trajectory["wellness_scores"][:7]) / 7
            recent_avg = sum(trajectory["wellness_scores"][-7:]) / 7
            
            if recent_avg > early_avg + 5:
                trajectory["trend"] = "improving"
            elif recent_avg < early_avg - 5:
                trajectory["trend"] = "declining"
            else:
                trajectory["trend"] = "stable"
        
        return trajectory


# Global instance
analytics_engine = AnalyticsInsightsEngine()
