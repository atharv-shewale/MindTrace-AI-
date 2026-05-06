from typing import Set, Dict, Optional
from fastapi import WebSocket
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time emotional tracking"""
    
    def __init__(self):
        # active_connections: user_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Register a new WebSocket connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        logger.info(f"✓ User {user_id} connected. Total: {len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            
            logger.info(f"✓ User {user_id} disconnected")
    
    async def send_personal_message(
        self,
        message: Dict,
        user_id: str
    ):
        """Send message to all connections of a user"""
        if user_id in self.active_connections:
            disconnected = []
            
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message: {e}")
                    disconnected.append(connection)
            
            # Clean up disconnected connections
            for connection in disconnected:
                self.active_connections[user_id].discard(connection)
    
    async def broadcast_to_user(
        self,
        user_id: str,
        event_type: str,
        data: Dict
    ):
        """Broadcast a typed event to user"""
        message = {
            "type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        
        await self.send_personal_message(message, user_id)
    
    async def broadcast_emotional_update(
        self,
        user_id: str,
        emotion: str,
        intensity: float,
        escalation_score: float,
        is_critical: bool
    ):
        """Broadcast emotional update"""
        await self.broadcast_to_user(
            user_id,
            "emotion_detected",
            {
                "emotion": emotion,
                "intensity": intensity,
                "escalation_score": escalation_score,
                "is_critical": is_critical,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    async def broadcast_escalation_alert(
        self,
        user_id: str,
        escalation_pattern: Dict,
        recommended_interventions: list
    ):
        """Broadcast escalation detection alert"""
        await self.broadcast_to_user(
            user_id,
            "escalation_detected",
            {
                "escalation_level": escalation_pattern.get("escalation_level"),
                "escalation_score": escalation_pattern.get("escalation_score"),
                "trigger_emotions": escalation_pattern.get("trigger_emotions"),
                "recommended_interventions": recommended_interventions,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    async def broadcast_wellness_score_update(
        self,
        user_id: str,
        wellness_score: float,
        stability_score: float,
        recovery_index: float
    ):
        """Broadcast wellness score update"""
        await self.broadcast_to_user(
            user_id,
            "wellness_update",
            {
                "emotional_wellness_score": wellness_score,
                "stability_score": stability_score,
                "recovery_index": recovery_index,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    async def broadcast_intervention_triggered(
        self,
        user_id: str,
        intervention: Dict
    ):
        """Broadcast when intervention is triggered"""
        await self.broadcast_to_user(
            user_id,
            "intervention_triggered",
            {
                "intervention": intervention,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    async def broadcast_insight_generated(
        self,
        user_id: str,
        insights: list,
        daily_scores: Dict
    ):
        """Broadcast daily insights"""
        await self.broadcast_to_user(
            user_id,
            "daily_insights",
            {
                "insights": insights,
                "daily_scores": daily_scores,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    def get_active_users(self) -> int:
        """Get count of active users"""
        return len(self.active_connections)
    
    def get_active_connections(self, user_id: str) -> int:
        """Get count of active connections for a user"""
        return len(self.active_connections.get(user_id, set()))


# Global instance
manager = ConnectionManager()
