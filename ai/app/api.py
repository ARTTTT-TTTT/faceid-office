from fastapi import APIRouter

from app.routes import detection, setting, user_log
from app.constants.settings import settings as app_settings

api_router = APIRouter()
api_router.include_router(detection.router)
api_router.include_router(setting.router)

if app_settings.ENVIRONMENT == "local":
    api_router.include_router(user_log.router)
