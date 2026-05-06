import logging
import os
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class AlertService:
    def __init__(self):
        self.admin_email = os.getenv("ADMIN_EMAIL", "support@mindtrace.ai")

    async def send_guardian_alert(self, user_name: str, guardian_email: str, emotion: str, intensity: float, content_snippet: str):
        """Simulate sending an email alert to the guardian"""
        if not guardian_email:
            logger.warning(f"No guardian email for user {user_name}. Alert skipped.")
            return

        subject = f"MINDTRACE AI+ | Critical Neural Alert for {user_name}"
        body = (
            f"Hello,\n\n"
            f"This is an automated neural alert from MindTrace AI+. "
            f"Our systems have detected a critical emotional state for {user_name}.\n\n"
            f"Detected State: {emotion.upper()}\n"
            f"Intensity: {intensity*100:.1f}%\n"
            f"Context: \"{content_snippet}...\"\n\n"
            f"We recommend checking in on them and providing support. "
            f"This alert was triggered based on real-time neural pattern analysis.\n\n"
            f"Stay Safe,\nMindTrace AI+ Monitoring Team"
        )

        # In a real implementation, you would use an SMTP library or a service like SendGrid
        logger.error("!!! CRITICAL ALERT SENT !!!")
        logger.error(f"TO: {guardian_email}")
        logger.error(f"SUBJECT: {subject}")
        logger.error(f"BODY:\n{body}")
        
        # Log to a file or database for records
        with open("critical_alerts.log", "a") as f:
            f.write(f"[{datetime.now().isoformat()}] ALERT SENT TO {guardian_email} for {user_name} | Emotion: {emotion}\n")

alert_service = AlertService()
