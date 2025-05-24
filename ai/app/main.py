from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute

from app.api import api_router
from app.constants.app_config import settings


def custom_generate_unique_id(route: APIRoute) -> str:
    """
    ฟังก์ชันสำหรับสร้าง unique ID ให้กับ route เพื่อใช้ใน OpenAPI/Swagger UI
    """
    if route.tags:
        return f"{route.tags[0]}-{route.name}"
    return route.name


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_AI_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_AI_STR)


@app.get("/")
async def root():
    return {"message": "Welcome to the AI for FaceID Office!"}
