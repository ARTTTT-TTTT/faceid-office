import cv2
import numpy as np
from typing import Dict
from fastapi import WebSocket


class VideoStreamV1Service:
    _active_connections: Dict[str, WebSocket] = {}

    async def websocket_connection(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self._active_connections[user_id] = websocket
        print(f"WebSocket connection established for user: {user_id}")

        try:
            while True:
                data = await websocket.receive_bytes()
                processed_frame_bytes = self.process_video_frame(user_id, data)

                if processed_frame_bytes:
                    await websocket.send_bytes(processed_frame_bytes)

        except Exception as e:
            print(f"An error occurred for user {user_id}: {e}")
        finally:
            print(f"WebSocket connection disconnected or error for user: {user_id}")
            self.cleanup_user_connection(user_id)
            if user_id in self._active_connections:
                del self._active_connections[user_id]

    def process_video_frame(self, user_id: str, data: bytes) -> bytes | None:
        """
        ประมวลผลเฟรมวิดีโอที่ได้รับและเข้ารหัสกลับเป็นไบต์ (เช่น JPEG)
        """
        nparr = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is not None:
            text = f"User: {user_id}"
            cv2.putText(
                frame,
                text,
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2,
                cv2.LINE_AA,
            )

            _, encoded_image = cv2.imencode(".jpg", frame)
            return encoded_image.tobytes()
        else:
            print(
                f"Could not decode frame for user: {user_id}. Data length: {len(data)} bytes"
            )
            return None

    def cleanup_user_connection(self, user_id: str):
        """
        ทำความสะอาดทรัพยากรเมื่อผู้ใช้ตัดการเชื่อมต่อ (ในกรณีนี้ไม่มี Window ให้ปิด)
        """
        print(f"Cleaning up resources for user: {user_id}")


video_stream_service = VideoStreamV1Service()
