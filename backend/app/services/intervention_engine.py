from typing import Dict, List, Optional
from datetime import datetime
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class AdaptiveInterventionEngine:
    """
    Generates and triggers adaptive interventions based on emotional state.
    """
    
    def __init__(self):
        self.interventions = {
            "breathing_exercise": {
                "title": "Calming Breath Exercise",
                "description": "A guided breathing exercise to help calm your nervous system",
                "duration_seconds": 300,
                "type": "breathing"
            },
            "grounding_exercise": {
                "title": "5-4-3-2-1 Grounding Technique",
                "description": "Ground yourself in the present moment",
                "duration_seconds": 180,
                "type": "grounding"
            },
            "meditation": {
                "title": "Guided Meditation",
                "description": "A short guided meditation for emotional reset",
                "duration_seconds": 600,
                "type": "meditation"
            },
            "journaling_prompt": {
                "title": "Reflective Journaling",
                "description": "Express your feelings through guided prompts",
                "duration_seconds": 900,
                "type": "journaling"
            },
            "movement_exercise": {
                "title": "Gentle Movement",
                "description": "Light stretching and movement to release tension",
                "duration_seconds": 600,
                "type": "movement"
            },
            "safe_links": {
                "title": "Your Comfort Content",
                "description": "Access your saved calming content",
                "duration_seconds": None,
                "type": "content"
            },
            "emotional_reset": {
                "title": "Emotional Reset Session",
                "description": "Comprehensive recovery activity",
                "duration_seconds": 1200,
                "type": "reset"
            }
        }
        
        self.emotion_interventions_map = {
            "sadness": ["meditation", "journaling_prompt", "safe_links"],
            "anxiety": ["breathing_exercise", "grounding_exercise", "meditation"],
            "stress": ["breathing_exercise", "movement_exercise", "safe_links"],
            "burnout": ["emotional_reset", "meditation", "movement_exercise"],
            "frustration": ["breathing_exercise", "movement_exercise", "journaling_prompt"],
            "anger": ["grounding_exercise", "breathing_exercise", "movement_exercise"],
            "fatigue": ["meditation", "movement_exercise", "safe_links"],
            "loneliness": ["journaling_prompt", "safe_links", "meditation"],
        }
    
    def recommend_interventions(
        self,
        escalation_pattern: Dict,
        user_safe_links: List[Dict] = None,
        recent_effectiveness: Dict = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None
    ) -> List[Dict]:
        """
        Recommend appropriate interventions based on emotional state.
        """
        user_safe_links = user_safe_links or []
        recent_effectiveness = recent_effectiveness or {}
        
        trigger_emotions = escalation_pattern.get("trigger_emotions", [])
        escalation_level = escalation_pattern.get("escalation_level", "normal")
        escalation_score = escalation_pattern.get("escalation_score", 0.0)
        
        recommended = []
        
        # Select interventions based on trigger emotions
        selected_intervention_types = set()
        for emotion in trigger_emotions[:3]:  # Top 3 trigger emotions
            if emotion in self.emotion_interventions_map:
                for intervention_type in self.emotion_interventions_map[emotion]:
                    selected_intervention_types.add(intervention_type)
        
        # Escalation level determines intensity
        if escalation_level == "critical":
            # Add reset session for critical state
            selected_intervention_types.add("emotional_reset")
            recommended_count = 5
        elif escalation_level == "escalating":
            recommended_count = 3
        else:
            recommended_count = 2
        
        # Build intervention list with priority
        intervention_priority = []
        for intervention_type in selected_intervention_types:
            if intervention_type in self.interventions:
                intervention = self.interventions[intervention_type].copy()
                intervention["type_id"] = intervention_type
                
                # Calculate priority based on recent effectiveness
                effectiveness = recent_effectiveness.get(intervention_type, 0.5)
                intervention["priority"] = effectiveness
                
                intervention_priority.append(intervention)
        
        # Sort by priority and take top recommendations
        intervention_priority.sort(key=lambda x: x.get("priority", 0), reverse=True)
        recommended = intervention_priority[:recommended_count]
        
        # Add safe links if available
        if user_safe_links and len(recommended) < recommended_count:
            safe_links_intervention = self.interventions["safe_links"].copy()
            safe_links_intervention["type_id"] = "safe_links"
            safe_links_intervention["links"] = user_safe_links[:5]
            recommended.append(safe_links_intervention)
        
        return recommended
    
    def generate_intervention_sequence(
        self,
        escalation_pattern: Dict,
        user_safe_links: List[Dict] = None
    ) -> Dict:
        """
        Generate a complete intervention sequence/workflow.
        """
        user_safe_links = user_safe_links or []
        escalation_score = escalation_pattern.get("escalation_score", 0.0)
        escalation_level = escalation_pattern.get("escalation_level", "normal")
        
        # Stage 1: Immediate calming (breathing)
        stage1 = {
            "stage": 1,
            "name": "Immediate Calming",
            "interventions": [
                self.interventions["breathing_exercise"].copy()
            ]
        }
        
        # Stage 2: Grounding and focus
        stage2 = {
            "stage": 2,
            "name": "Grounding & Focus",
            "interventions": [
                self.interventions["grounding_exercise"].copy(),
                self.interventions["meditation"].copy()
            ]
        }
        
        # Stage 3: Deeper engagement (optional)
        stage3 = {
            "stage": 3,
            "name": "Recovery Activities",
            "interventions": []
        }
        
        if user_safe_links:
            safe_links_intervention = self.interventions["safe_links"].copy()
            safe_links_intervention["links"] = user_safe_links
            stage3["interventions"].append(safe_links_intervention)
        
        stage3["interventions"].append(self.interventions["journaling_prompt"].copy())
        
        # Critical escalation gets reset session
        if escalation_level == "critical":
            critical_stage = {
                "stage": 0,
                "name": "Critical Support",
                "interventions": [
                    self.interventions["emotional_reset"].copy()
                ]
            }
            return {
                "escalation_level": escalation_level,
                "stages": [critical_stage, stage1, stage2, stage3],
                "total_estimated_duration": 3000
            }
        
        return {
            "escalation_level": escalation_level,
            "stages": [stage1, stage2, stage3],
            "total_estimated_duration": 1380
        }
    
    def get_intervention_effectiveness(
        self,
        intervention_type: str,
        effectiveness_score: float,
        user_feedback: Optional[str] = None
    ) -> Dict:
        """Record intervention effectiveness for personalization"""
        return {
            "intervention_type": intervention_type,
            "effectiveness": max(0.0, min(1.0, effectiveness_score)),
            "user_feedback": user_feedback,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def suggest_coping_strategies(
        self,
        emotional_history: List[Dict],
        past_interventions: List[Dict]
    ) -> List[str]:
        """
        Suggest personalized coping strategies based on history.
        """
        strategies = []
        
        if not emotional_history or not past_interventions:
            return [
                "Try taking deep breaths when you feel overwhelmed",
                "Consider journaling to express your emotions",
                "Spend time on activities you enjoy"
            ]
        
        # Analyze what has worked before
        effective_interventions = {}
        for intervention in past_interventions:
            intervention_type = intervention.get("type", "")
            effectiveness = intervention.get("effectiveness", 0.5)
            
            if effectiveness > 0.7:
                if intervention_type not in effective_interventions:
                    effective_interventions[intervention_type] = []
                effective_interventions[intervention_type].append(effectiveness)
        
        # Generate suggestions based on what worked
        for intervention_type, scores in effective_interventions.items():
            avg_effectiveness = sum(scores) / len(scores)
            if avg_effectiveness > 0.75:
                if intervention_type == "breathing_exercise":
                    strategies.append("Try your breathing exercises - they work well for you!")
                elif intervention_type == "meditation":
                    strategies.append("Consider meditation when you need emotional reset")
                elif intervention_type == "journaling_prompt":
                    strategies.append("Express yourself through journaling")
                elif intervention_type == "movement_exercise":
                    strategies.append("Physical movement helps you feel better")
                elif intervention_type == "safe_links":
                    strategies.append("Access your comfort content collection")
        
        if not strategies:
            strategies = [
                "Practice mindfulness throughout your day",
                "Connect with activities that bring you joy",
                "Remember: emotions are temporary and manageable"
            ]
        
        return strategies


# Global instance
intervention_engine = AdaptiveInterventionEngine()
