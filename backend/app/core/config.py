from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List, Any
from pydantic import field_validator
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=True)

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
    CORS_ORIGINS: List[str] = ["https://mindtrace-frontend.netlify.app", "https://mindtrace-ai.netlify.app", "http://localhost:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            # Handle JSON list format
            if v.startswith("[") and v.endswith("]"):
                try:
                    import json
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(i).strip().rstrip('/') for i in parsed if i]
                except Exception:
                    pass
            # Handle comma-separated string format
            return [i.strip().rstrip('/') for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(i).strip().rstrip('/') for i in v if i]
        return v if v else []

    HUGGINGFACE_TOKEN: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None


settings = Settings()
