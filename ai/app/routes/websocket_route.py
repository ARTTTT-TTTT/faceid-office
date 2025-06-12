from fastapi import APIRouter, WebSocket, Depends
from typing import Dict

from app.services.webscoket_service import WebsocketService

router = APIRouter(tags=["WEBSOCKET"])

# Dictionary เพื่อเก็บการเชื่อมต่อ WebSocket ที่ใช้งานอยู่
# ?FEATURE (สามารถย้ายไป service หรือ Redis ได้ใน production)
active_connections: Dict[str, WebSocket] = {}


def get_websocket_service(admin_id: str) -> WebsocketService:
    return WebsocketService(admin_id)


@router.websocket("/{admin_id}")
async def websocket(
    websocket: WebSocket,
    admin_id: str,
    websocket_service: WebsocketService = Depends(get_websocket_service),
):
    """
    Endpoint สำหรับ WebSocket เพื่อรับสตรีมวิดีโอจาก Client

    Parameters:
    - websocket: อ็อบเจกต์ WebSocket ที่ใช้ในการสื่อสาร
    - user_id: รหัสของผู้ใช้ที่เชื่อมต่อ
    """
    await websocket_service.websocket_connection(websocket, admin_id)
