import secrets

from typing import Any, Literal
from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
  
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    PROJECT_NAME: str
    API_AI_STR: str = "/api/ai"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # # การตั้งค่าหมายเลขพอร์ตฐานข้อมูล
    # POSTGRES_SERVER: str
    # POSTGRES_PORT: int = 5432
    # POSTGRES_USER: str
    # POSTGRES_PASSWORD: str = ""
    # POSTGRES_DB: str = ""
    
    FRONTEND_HOST: str = "http://localhost:3000"
    BACKEND_CORS_ORIGINS: list[AnyUrl] | str = []

    @property
    def all_cors_origins(self) -> list[str]:
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return self.BACKEND_CORS_ORIGINS.split(",") + [self.FRONTEND_HOST]
        return [str(origin) for origin in self.BACKEND_CORS_ORIGINS] + [self.FRONTEND_HOST]

settings = Settings()

