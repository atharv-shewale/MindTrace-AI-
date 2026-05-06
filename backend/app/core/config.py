from pydantic_settings import BaseSettings
from typing import Optional, List, Any
from pydantic import validator, field_validator
import os


class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "MINDTRACE AI+"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017/mindtrace"
    MONGODB_DB: str = "mindtrace_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # AI Models
    EMOTION_MODEL: str = "j-hartmann/emotion-english-distilroberta-base"
    SENTIMENT_MODEL: str = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Emotion Thresholds
    ESCALATION_THRESHOLD: float = 0.7
    CRITICAL_THRESHOLD: float = 0.85
    WINDOW_SIZE: int = 3600  # 1 hour in seconds
    
    # CORS Origins - Whitelist for Netlify and Local
    CORS_ORIGINS: Any = [
        "https://mindtrace-frontend.netlify.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://mindtrace-backend-75jm.onrender.com"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [i.strip().rstrip('/') for i in parsed]
                except Exception:
                    pass
            # Handle comma-separated string
            return [i.strip().rstrip('/') for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(i).strip().rstrip('/') for i in v]
        return v

    HUGGINGFACE_TOKEN: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    class Config:
      env_file = ".env"
      case_sensitive = True
      extra = "ignore"


settings = Settings()
