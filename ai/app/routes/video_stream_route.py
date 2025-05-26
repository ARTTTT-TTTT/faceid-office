from fastapi import APIRouter, WebSocket

from app.services.video_stream_service import video_stream_service

router = APIRouter(prefix="/video-stream", tags=["VIDEO STREAM"])


@router.websocket("/ws/video/{user_id}")
async def websocket(websocket: WebSocket, user_id: str):
    await video_stream_service.websocket_connection(websocket, user_id)
