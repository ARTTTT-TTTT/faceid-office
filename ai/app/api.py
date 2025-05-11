from fastapi import APIRouter

from app.routes import detection, user_log
from app.constants.settings import settings

api_router = APIRouter()
api_router.include_router(detection.router)

if settings.ENVIRONMENT == "local":
    api_router.include_router(user_log.router)