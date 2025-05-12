import secrets

from typing import Any, Literal
from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    PROJECT_NAME: str = "AI"
    API_AI_STR: str = "/api/ai"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    MONGO_DB_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "FaceID-Office"
    MONGO_DB_USERS_COLLECTION: str = "users"
    MONGO_DB_USER_LOGS_COLLECTION: str = "user_logs"
    MONGO_DB_SETTINGS_COLLECTION: str = "settings"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    FRONTEND_HOST: str = "http://localhost:3000"
    BACKEND_CORS_ORIGINS: list[AnyUrl] | str = []

    @property
    def all_cors_origins(self) -> list[str]:
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return self.BACKEND_CORS_ORIGINS.split(",") + [self.FRONTEND_HOST]
        return [str(origin) for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]

    # ==== NOT IN ENV ====

    # ==== DETECTION ====
    YOLO_MODEL: str = "yolov11l-face.pt"
    KNOWN_FACES: str = "person_npy"
    FACE_EMBEDDER_MODEL: str = "vggface2"
    CONFIDENCE_THRESHOLD: float = 0.8
    BEST_DISTANCE_THRESHOLD: float = 0.25

    # ==== REDIS ====
    ADMIN_PREFIX: str = "id"
    USER_PREFIX: str = "user_logged"
    TRACKING_SUFFIX: str = "tracking"

    # ==== SETTINGS ====
    USER_LOG_EXPIRE_SECONDS: int = 60 * 60 * 2  # 2 ชั่วโมง
    WORK_START_TIME: int = 23  # 23:00


settings = Settings()
