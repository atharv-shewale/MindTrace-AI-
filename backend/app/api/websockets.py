from fastapi import APIRouter
from typing import Dict
from app.websocket.manager import manager

router = APIRouter()


@router.get("/active")
async def active_ws_stats() -> Dict:
    """Return debugging stats for active WebSocket connections."""
    users = {uid: len(conns) for uid, conns in manager.active_connections.items()}
    return {
        "active_users": manager.get_active_users(),
        "connections_per_user": users,
    }
