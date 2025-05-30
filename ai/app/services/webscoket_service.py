import cv2
import numpy as np
from typing import Dict
from fastapi import WebSocket
from app.core.face_tracking import face_tracking
import asyncio
import time


class WebsocketService:
    _active_connections: Dict[str, WebSocket] = {}
    _latest_frame: Dict[str, bytes] = {}  # Store the latest frame for each user

    async def websocket_connection(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self._active_connections[user_id] = websocket
        face_tracking.load_faiss_index()
        print(f"WebSocket connection established for user: {user_id}")

        try:
            while True:
                start_time = time.time()  # Start time for processing
                # Check for new frame without blocking
                try:
                    # Use a small timeout to avoid blocking the event loop
                    data = await asyncio.wait_for(
                        websocket.receive_bytes(), timeout=0.05
                    )
                    self._latest_frame[user_id] = data  # Store the latest frame
                except asyncio.TimeoutError:
                    # No new frame, process the latest frame if available
                    if user_id in self._latest_frame:
                        data = self._latest_frame[user_id]
                        nparr = np.frombuffer(data, np.uint8)
                        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        if frame is not None:
                            # Downscale frame to reduce processing time
                            frame = cv2.resize(frame, (640, 480))
                            annotation, result = face_tracking.tracking_face(frame)
                            if result:
                                print(
                                    "Results:",
                                    result,
                                    "time:",
                                    time.time() - start_time,
                                )
                            # if annotation is not None:
                            #     # print("Frame shape:", frame.shape)
                            #     cv2.imshow("result", annotation)
                            # else:
                            #     print("Frame is None!")
                            #     cv2.imshow("result", frame)
                            # if cv2.waitKey(1) & 0xFF == ord("q"):
                            #     break

                            if annotation is None:
                                annotation = frame

                            # Optional: Send processed results back to client
                            frame_result = self.process_video_frame(user_id, annotation)
                            if frame_result is not None:
                                _, buffer = cv2.imencode(".jpg", frame_result)
                                await websocket.send_bytes(buffer.tobytes())

                    # Short sleep to prevent CPU overuse
                    await asyncio.sleep(0.05)
                except Exception as e:
                    print(f"Error processing frame for user {user_id}: {e}")
                    break

        except Exception as e:
            print(f"An error occurred for user {user_id}: {e}")
        finally:
            print(f"WebSocket connection disconnected for user: {user_id}")
            self.cleanup_user_connection(user_id)
            if user_id in self._active_connections:
                del self._active_connections[user_id]
            if user_id in self._latest_frame:
                del self._latest_frame[user_id]

    def cleanup_user_connection(self, user_id: str):
        print(f"Cleaning up resources for user: {user_id}")

    def process_video_frame(self, user_id, frame):
        # Example: Draw a red rectangle around the frame
        height, width, _ = frame.shape
        # cv2.rectangle(frame, (50, 50), (width - 50, height - 50), (0, 0, 255), 3)
        return frame


websocket_service = WebsocketService()
