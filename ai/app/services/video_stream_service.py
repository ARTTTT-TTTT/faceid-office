import cv2
import numpy as np
from typing import Dict
from fastapi import WebSocket

from app.services.core_service import CoreService


class VideoStreamService:
    _active_connections: Dict[str, WebSocket] = {}

    def __init__(self):
        self.face_tracking = CoreService()

    async def websocket_connection(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self._active_connections[user_id] = websocket
        print(f"WebSocket connection established for user: {user_id}")

        try:
            while True:
                data = await websocket.receive_bytes()

                nparr = np.frombuffer(data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is not None:
                    processed_frame_bytes, names = self.face_tracking.process_frame(
                        user_id, frame
                    )

                    print(
                        f"[{user_id}] Found: {', '.join(names) if names else 'No faces detected'}"
                    )

                    if processed_frame_bytes:
                        await websocket.send_bytes(processed_frame_bytes)
                else:
                    print(f"Invalid frame from user: {user_id}")

        except Exception as e:
            print(f"An error occurred for user {user_id}: {e}")
        finally:
            print(f"WebSocket disconnected: {user_id}")
            self.cleanup_user_connection(user_id)
            if user_id in self._active_connections:
                del self._active_connections[user_id]

    def cleanup_user_connection(self, user_id: str):
        print(f"Cleaning up resources for user: {user_id}")


video_stream_service = VideoStreamService()
