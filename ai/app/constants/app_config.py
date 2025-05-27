from typing import Literal
from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    PROJECT_NAME: str = "AI"
    API_AI_STR: str = "/api/ai"
    AI_SECRET_KEY: str = "ai_secret_key"
    
    SERVER_URL: str = "http://localhost:8080"

    FRONTEND_HOST: str = "http://localhost:3000"
    BACKEND_CORS_ORIGINS: list[AnyUrl] | str = []

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "redis_secret"

    LIVEKIT_KEY: str = "livekitkey"
    LIVEKIT_SECRET: str = "livekitsecret"

    TURN_SECRET: str = "turnsecret"
    TURN_TTL: int = 3600

    @property
    def all_cors_origins(self) -> list[str]:
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return self.BACKEND_CORS_ORIGINS.split(",") + [self.FRONTEND_HOST]
        return [str(origin) for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]


settings = Settings()
