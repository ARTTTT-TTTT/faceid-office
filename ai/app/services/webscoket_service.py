import cv2
import numpy
import base64
import json
import asyncio

from typing import Dict
from fastapi import WebSocket

from app.core.face_tracking import FaceTracking
from app.configs.core_config import CoreConfig


class WebsocketService:
    def __init__(self, admin_id: str):
        self._active_connections: Dict[str, WebSocket] = {}
        self._latest_frame: Dict[str, bytes] = {}
        self.core_config = CoreConfig(admin_id)
        self.face_tracking = FaceTracking(self.core_config)

    async def websocket_connection(self, websocket: WebSocket, admin_id: str):
        await websocket.accept()
        self._active_connections[admin_id] = websocket
        self.face_tracking.load_faiss_index()
        print(
            f"[CONNECTED] WebSocket \n admin_id: {admin_id}  \n camera_id: {admin_id} \n session_id: {admin_id} \n ==="
        )

        try:
            while True:
                try:
                    data = await asyncio.wait_for(websocket.receive_bytes(), timeout=0.05)
                    self._latest_frame[admin_id] = data
                except asyncio.TimeoutError:
                    if admin_id in self._latest_frame:
                        data = self._latest_frame[admin_id]
                        nparr = numpy.frombuffer(data, numpy.uint8)
                        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        if frame is not None:
                            frame = cv2.resize(frame, (640, 480))
                            annotation, result = self.face_tracking.tracking_face(frame)

                            if annotation is None:
                                annotation = frame
                            _, buffer = cv2.imencode(".jpg", annotation)
                            img_str = base64.b64encode(buffer).decode("utf-8")

                            await websocket.send_text(
                                json.dumps({"image": img_str, "result": result})
                            )

                    await asyncio.sleep(0.05)
                except Exception:
                    # ? ตามปกติจะไม่เกิด error ไม่มีปัญหา
                    # ? print(f"[ERROR] processing frame for admin_id {admin_id}: {e}")
                    break

        except Exception as e:
            if e:
                print(
                    f"[ERROR] WebSocket \n admin_id: {admin_id} \n camera_id: {admin_id} \n session_id: {admin_id} \n error: {e} \n ==="
                )
        finally:
            print(
                f"[DISCONNECTED] WebSocket \n admin_id: {admin_id}  \n camera_id: {admin_id} \n session_id: {admin_id} \n ==="
            )
            if admin_id in self._active_connections:
                del self._active_connections[admin_id]
            if admin_id in self._latest_frame:
                del self._latest_frame[admin_id]
