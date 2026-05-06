from pydantic_settings import BaseSettings
from typing import Optional, Any
import os


class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "MINDTRACE AI+"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # Database
    MONGODB_URL: str = "mongodb+srv://user:password@cluster.mongodb.net/mindtrace"
    MONGODB_DB: str = "mindtrace_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI Models
    EMOTION_MODEL: str = "j-hartmann/emotion-english-distilroberta-base"
    SENTIMENT_MODEL: str = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Emotion Thresholds
    ESCALATION_THRESHOLD: float = 0.7
    CRITICAL_THRESHOLD: float = 0.85
    WINDOW_SIZE: int = 3600  # 1 hour in seconds
    
    # API Settings
    CORS_ORIGINS: Any = ["*"]
    
    @property
    def cors_origins_list(self) -> list:
        if isinstance(self.CORS_ORIGINS, str):
            # Handle JSON-like strings: ["http://url1", "http://url2"]
            # Or comma-separated: http://url1, http://url2
            raw = self.CORS_ORIGINS.strip()
            if raw.startswith("[") and raw.endswith("]"):
                import json
                try:
                    return json.loads(raw)
                except:
                    # Fallback if JSON fails
                    raw = raw.strip("[]")
            
            return [origin.strip().strip('"\'') for origin in raw.split(",") if origin.strip()]
        return self.CORS_ORIGINS
    HUGGINGFACE_TOKEN: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    class Config:
      env_file = ".env"
      case_sensitive = True
      extra = "ignore"


settings = Settings()
