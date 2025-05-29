from fastapi import APIRouter


from app.routes import (
    vector_route,
    websocket_route,
    video_stream_v1_route,
    video_stream_v2_route,
)
from app.constants.app_config import settings as app_settings

api_router = APIRouter()

if app_settings.ENVIRONMENT == "local":
    api_router.include_router(vector_route.router)
    api_router.include_router(websocket_route.router)
    api_router.include_router(video_stream_v1_route.router)
    api_router.include_router(video_stream_v2_route.router)
