import cv2
import numpy as np
from typing import Dict
from typing import Tuple
from fastapi import WebSocket

from app.services.core_service import CoreService


class VideoStreamService:
    _active_connections: Dict[Tuple[str, str, str], WebSocket] = {}

    def __init__(self):
        self.face_tracking = CoreService()

    async def websocket_connection(
        self, websocket: WebSocket, admin_id: str, camera_id: str, session_id: str
    ):
        await websocket.accept()
        self._active_connections[admin_id, camera_id, session_id] = websocket

        try:
            while True:
                data = await websocket.receive_bytes()

                nparr = np.frombuffer(data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is not None:
                    processed_frame_bytes = self.face_tracking.process_frame(frame)
                else:
                    print(f"Invalid frame from user: {admin_id}")
                if processed_frame_bytes:
                    await websocket.send_bytes(processed_frame_bytes)

        except Exception as e:
            print(f"An error occurred for user {admin_id}: {e}")
        finally:
            print(f"WebSocket disconnected: {admin_id}")
            self.cleanup_user_connection(admin_id, camera_id, session_id)
            key = (admin_id, camera_id, session_id)
            if key in self._active_connections:
                del self._active_connections[key]

    def cleanup_user_connection(self, admin_id: str, camera_id: str, session_id: str):
        print(
            f"Cleaning up resources for user: {admin_id}, camera: {camera_id}, session: {session_id}"
        )


video_stream_service = VideoStreamService()
