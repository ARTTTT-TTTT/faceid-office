from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict

from app.services import video_stream_v1_service

router = APIRouter(prefix="/video-stream-v1", tags=["VIDEO STREAM V1"])

# Dictionary เพื่อเก็บการเชื่อมต่อ WebSocket ที่ใช้งานอยู่ 
# ?FEATURE (สามารถย้ายไป service หรือ Redis ได้ใน production)
active_connections: Dict[str, WebSocket] = {}


@router.websocket("/ws/video/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    Endpoint สำหรับ WebSocket เพื่อรับสตรีมวิดีโอจาก Client

    Parameters:
    - websocket: อ็อบเจกต์ WebSocket ที่ใช้ในการสื่อสาร
    - user_id: รหัสของผู้ใช้ที่เชื่อมต่อ
    """
    await websocket.accept()
    active_connections[user_id] = websocket
    print(f"WebSocket connection established for user: {user_id}")

    try:
        while True:
            data = await websocket.receive_bytes()
            await video_stream_v1_service.process_video_frame(user_id, data)

            if video_stream_v1_service.should_close_opencv_window(user_id):
                break

    except WebSocketDisconnect:
        print(f"WebSocket connection disconnected for user: {user_id}")
        video_stream_v1_service.cleanup_user_connection(user_id)
        if user_id in active_connections:
            del active_connections[user_id]
    except Exception as e:
        print(f"An error occurred for user {user_id}: {e}")
        video_stream_v1_service.cleanup_user_connection(user_id)
        if user_id in active_connections:
            del active_connections[user_id]
