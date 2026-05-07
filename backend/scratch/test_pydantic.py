from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Any, List
import os

class Settings(BaseSettings):
    CORS_ORIGINS: Any = ["http://localhost:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        print(f"DEBUG: v type={type(v)}, v={v}")
        if isinstance(v, str):
            if v.startswith("["):
                import json
                return json.loads(v)
            return v.split(",")
        return v

# Test with comma separated string
os.environ["CORS_ORIGINS"] = "http://a,http://b"
try:
    s = Settings()
    print(f"SUCCESS: {s.CORS_ORIGINS}")
except Exception as e:
    print(f"FAILED: {e}")

# Test with JSON string
os.environ["CORS_ORIGINS"] = '["http://c", "http://d"]'
try:
    s = Settings()
    print(f"SUCCESS: {s.CORS_ORIGINS}")
except Exception as e:
    print(f"FAILED: {e}")
