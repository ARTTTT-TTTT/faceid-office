import cv2
import numpy as np
from typing import Dict

_opencv_windows_status: Dict[str, bool] = {}


async def process_video_frame(user_id: str, data: bytes):
    """
    ประมวลผลเฟรมวิดีโอที่ได้รับ

    Parameters:
    - user_id: รหัสของผู้ใช้ที่ส่งเฟรมมา
    - data: ข้อมูลไบต์ของเฟรมวิดีโอ
    """
    nparr = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is not None:
        window_name = f"User {user_id} Video Stream"
        cv2.imshow(window_name, frame)

        _opencv_windows_status[user_id] = True

        if cv2.waitKey(1) & 0xFF == ord("q"):
            print(f"User {user_id} pressed 'q'. Closing OpenCV window.")
            _opencv_windows_status[user_id] = False
            cv2.destroyWindow(window_name)
    else:
        print(
            f"Could not decode frame for user: {user_id}. Data length: {len(data)} bytes"
        )


def should_close_opencv_window(user_id: str) -> bool:
    """
    ตรวจสอบว่าหน้าต่าง OpenCV สำหรับผู้ใช้รายนี้ควรปิดหรือไม่
    """
    return _opencv_windows_status.get(user_id, False) == False


def cleanup_user_connection(user_id: str):
    """
    ทำความสะอาดทรัพยากรเมื่อผู้ใช้ตัดการเชื่อมต่อ

    Parameters:
    - user_id: รหัสของผู้ใช้ที่ตัดการเชื่อมต่อ
    """
    print(f"Cleaning up resources for user: {user_id}")
    if user_id in _opencv_windows_status:
        window_name = f"User {user_id} Video Stream"
        cv2.destroyWindow(window_name)
        del _opencv_windows_status[user_id]
