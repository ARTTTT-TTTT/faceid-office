from fastapi import APIRouter, WebSocket
from typing import Dict

from app.services.webscoket_service import websocket_service

router = APIRouter(prefix="/ws", tags=["WEBSOCKET"])

# Dictionary เพื่อเก็บการเชื่อมต่อ WebSocket ที่ใช้งานอยู่
# ?FEATURE (สามารถย้ายไป service หรือ Redis ได้ใน production)
active_connections: Dict[str, WebSocket] = {}


@router.websocket("/{user_id}")
async def websocket(websocket: WebSocket, user_id: str):
    """
    Endpoint สำหรับ WebSocket เพื่อรับสตรีมวิดีโอจาก Client

    Parameters:
    - websocket: อ็อบเจกต์ WebSocket ที่ใช้ในการสื่อสาร
    - user_id: รหัสของผู้ใช้ที่เชื่อมต่อ
    """
    await websocket_service.websocket_connection(websocket, user_id)
