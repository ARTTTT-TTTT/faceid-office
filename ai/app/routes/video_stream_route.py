from fastapi import APIRouter, WebSocket

from app.services.video_stream_service import video_stream_service

router = APIRouter(prefix="/video-stream", tags=["VIDEO STREAM"])


@router.websocket("/{admin_id}/{camera_id}/{session_id}")
async def websocket(
    websocket: WebSocket, admin_id: str, camera_id: str, session_id: str
):
    await video_stream_service.websocket_connection(
        websocket, admin_id, camera_id, session_id
    )
