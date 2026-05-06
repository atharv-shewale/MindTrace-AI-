from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.ai.emotion_detector import emotion_engine
from app.api import auth, emotions, journal, interventions, analytics, chatbot, sos, safe_links, users, websockets, companion

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown"""
    # Startup
    logger.info("Starting MINDTRACE AI+ Backend...")
    await connect_to_mongo()
    await emotion_engine.initialize()
    logger.info("[OK] All services initialized")
    yield
    # Shutdown
    logger.info("Shutting down MINDTRACE AI+ Backend...")
    await close_mongo_connection()
    logger.info("[OK] Shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    description="Realtime Emotional Intelligence and Adaptive Wellness Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(emotions.router, prefix="/api/emotions", tags=["Emotions"])
app.include_router(journal.router, prefix="/api/journal", tags=["Journaling"])
app.include_router(interventions.router, prefix="/api/interventions", tags=["Interventions"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(sos.router, prefix="/api/sos", tags=["SOS"])
app.include_router(safe_links.router, prefix="/api/safe-links", tags=["Safe Links"])
app.include_router(companion.router, prefix="/api/companion", tags=["Companion"])
app.include_router(websockets.router, prefix="/api/ws", tags=["WebSockets"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to MINDTRACE AI+",
        "description": "Realtime Emotional Intelligence and Adaptive Wellness Platform",
        "status": "operational",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
