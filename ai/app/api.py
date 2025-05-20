from fastapi import APIRouter

from app.routes import detection
from app.constants.config import settings as app_settings

api_router = APIRouter()

if app_settings.ENVIRONMENT == "local":
    api_router.include_router(detection.router)
