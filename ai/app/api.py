from fastapi import APIRouter

from app.routes import core_route
from app.routes import vector_route
from app.routes import video_stream_v1_route
from app.routes import video_stream_v2_route
from app.constants.app_config import settings as app_settings

api_router = APIRouter()

if app_settings.ENVIRONMENT == "local":
    api_router.include_router(core_route.router)
    api_router.include_router(vector_route.router)
    api_router.include_router(video_stream_v1_route.router)
    api_router.include_router(video_stream_v2_route.router)
