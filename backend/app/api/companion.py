from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user
from app.services.companion_service import companion_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_companion(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Interact with the Empathetic Companion AI
    """
    user_id = current_user["sub"]
    try:
        response = await companion_service.chat_with_companion(user_id, request.message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
