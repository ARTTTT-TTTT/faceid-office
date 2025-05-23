import socketio

from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.api import api_router
from app.constants.app_config import settings


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


fastapi_app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_AI_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app = socketio.ASGIApp(sio, fastapi_app)

if settings.all_cors_origins:
    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

fastapi_app.include_router(api_router, prefix=settings.API_AI_STR)
