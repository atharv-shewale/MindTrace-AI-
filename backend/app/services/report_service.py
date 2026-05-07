import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.core.database import get_database
from app.services.scoring_engine import scoring_engine
from app.ai.emotion_detector import emotion_engine

logger = logging.getLogger(__name__)

class ReportService:
    """
    Automated Reporting Service
    Generates daily, weekly, and monthly emotional synthesis reports.
    """
    
    async def generate_daily_report(self, user_id: str) -> Dict[str, Any]:
        """Generate a comprehensive daily summary for a user"""
        db = get_database()
        
        # 1. Fetch all emotional events for the last 24h
        cutoff = datetime.utcnow() - timedelta(days=1)
        events = await db.realtime_emotion_events.find({
            "user_id": user_id,
            "timestamp": {"$gt": cutoff}
        }).to_list(1000)
        
        if not events:
            return {"status": "no_data", "message": "Insufficient data for today's report."}
            
        # 2. Aggregate metrics
        dominant_emotions = self._get_dominant_emotions(events)
        avg_intensity = sum(e["intensity"] for e in events) / len(events)
        
        # 3. Get wellness score
        score_data = await scoring_engine.calculate_daily_wellness_score(user_id)
        
        # 4. Generate AI suggestions based on patterns
        suggestions = await self._generate_ai_suggestions(user_id, events)
        
        report = {
            "user_id": user_id,
            "type": "daily",
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "wellness_index": score_data.get("emotional_wellness_score", 50),
            "dominant_moods": dominant_emotions,
            "average_intensity": round(avg_intensity, 2),
            "total_sync_events": len(events),
            "suggestions": suggestions,
            "status": "completed"
        }
        
        # Save to database
        await db.reports.insert_one({**report, "created_at": datetime.utcnow()})
        
        # Trigger Email (Mocked for now)
        await self._send_report_email(user_id, report)
        
        return report

    def _get_dominant_emotions(self, events: List[Dict]) -> List[str]:
        counts = {}
        for e in events:
            mood = e["emotion"]
            counts[mood] = counts.get(mood, 0) + 1
        
        sorted_moods = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        return [m[0] for m in sorted_moods[:3]]

    async def _generate_ai_suggestions(self, user_id: str, events: List[Dict]) -> List[str]:
        # Simple heuristic suggestions for now
        # In production, this would call Groq/LLM
        sad_count = sum(1 for e in events if e["emotion"].lower() == "sadness")
        anger_count = sum(1 for e in events if e["emotion"].lower() == "anger")
        
        suggestions = ["Continue your daily neural sync practices."]
        
        if sad_count > 10:
            suggestions.append("We noticed a persistent low mood. Try the 'Joy Recovery' protocol tomorrow morning.")
        if anger_count > 5:
            suggestions.append("Some spikes in frustration were detected. Consider adding a short box-breathing session at midday.")
        
        suggestions.append("Your emotional stability is trending upwards. Keep it up!")
        return suggestions

    async def _send_report_email(self, user_id: str, report: Dict):
        """Simulate sending an email report"""
        db = get_database()
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(user_id)}) if isinstance(user_id, str) else None
        
        if not user:
            user = await db.users.find_one({"_id": user_id})
            
        email = user.get("email", "user@example.com")
        
        logger.info(f"📧 SENDING REPORT EMAIL TO {email}")
        logger.info(f"Report Type: {report['type']} | Wellness Index: {report['wellness_index']}%")
        
        # In a real app, integrate with SendGrid, Mailgun, or FastAPI-Mail
        return True

report_service = ReportService()
