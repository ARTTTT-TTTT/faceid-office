# face_blob.py - คลาสสำหรับเก็บข้อมูลและติดตามใบหน้า
"""
เก็บข้อมูลและสถานะของใบหน้าแต่ละคนที่ตรวจพบ รวมถึงการติดตามการเคลื่อนไหวด้วย Kalman Filter
"""
import cv2
import numpy as np


class FaceBlob:
    def __init__(self, id, position, image=None, life_time=5):
        """
        ตั้งค่าอ็อบเจ็กต์ FaceBlob

        Args:
            id: รหัสเฉพาะของ blob
            position: พิกัดตำแหน่ง (x, y)
            image: ภาพใบหน้า (ถ้ามี)
            life_time: เวลาที่อยู่ได้ก่อนถูกลบ (frames)
        """
        self.id = id
        self.position = position
        self.image = image
        self.life = life_time
        self.matched_person_name = None
        self.match_history = {}

        # ตั้งค่า Kalman Filter สำหรับการติดตาม
        self.setup_kalman_filter()

    def setup_kalman_filter(self):
        """
        ตั้งค่า Kalman Filter สำหรับการติดตามตำแหน่ง x, y
        """
        self.kalman = cv2.KalmanFilter(4, 2)  # state: [x, y, dx, dy]
        self.kalman.measurementMatrix = np.array(
            [[1, 0, 0, 0], [0, 1, 0, 0]], np.float32
        )
        self.kalman.transitionMatrix = np.array(
            [[1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 1, 0], [0, 0, 0, 1]], np.float32
        )
        self.kalman.processNoiseCov = np.eye(4, dtype=np.float32) * 0.03

        # ตั้งค่าสถานะเริ่มต้น
        initial_state = np.array(
            [[self.position[0]], [self.position[1]], [0], [0]], dtype=np.float32
        )
        self.kalman.statePre = initial_state.copy()
        self.kalman.statePost = initial_state.copy()

    def predict_position(self):
        """
        ทำนายตำแหน่งในเฟรมถัดไปโดยใช้ Kalman Filter

        Returns:
            (x, y): ตำแหน่งที่ทำนาย
        """
        prediction = self.kalman.predict()
        return int(prediction[0, 0]), int(prediction[1, 0])

    def update(self, position, image, matched_person_name):
        """
        อัพเดทสถานะของ Blob

        Args:
            position: ตำแหน่งใหม่ (x, y)
            image: ภาพใบหน้าใหม่
            matched_person_name: ชื่อบุคคลที่ตรวจพบ
        """
        self.position = position
        self.image = image
        self.life = 5  # รีเซ็ตอายุการใช้งาน

        # อัพเดท Kalman Filter
        self.kalman.correct(np.array([[position[0]], [position[1]]], dtype=np.float32))

        # บันทึกประวัติการตรวจพบ
        self.matched_person_name = matched_person_name
        self.match_history[matched_person_name] = (
            self.match_history.get(matched_person_name, 0) + 1
        )

    def get_match_summary(self):
        """
        สรุปผลการตรวจพบใบหน้า

        Returns:
            name: ชื่อบุคคลที่ตรวจพบมากที่สุด หรือ "Unknown"
            summary: ข้อความสรุปประวัติการตรวจพบ
            image: ภาพใบหน้าล่าสุด
        """
        SURE_KNOW = 0
        SURE_UNKNOWN = 0

        # สร้างข้อความสรุป
        summary = ", ".join(f"{k}: {v}" for k, v in self.match_history.items())

        # แยกเฉพาะชื่อที่ไม่ใช่ "Unknown" และเช็คว่าตรง ≥ SURE_KNOW
        valid_named = {
            name: count
            for name, count in self.match_history.items()
            if name != "Unknown" and count >= SURE_KNOW
        }

        best_match_name, best_match_count = (None, 0)
        if valid_named:
            best_match_name, best_match_count = max(
                valid_named.items(), key=lambda x: x[1]
            )

        unknown_count = self.match_history.get("Unknown", 0)

        # ตัดสินใจว่าใบหน้านี้เป็นของใคร
        if unknown_count >= max(SURE_UNKNOWN, best_match_count * 2):
            return "Unknown", summary, self.image

        if (
            best_match_name
            and unknown_count <= best_match_count * 2
            and unknown_count >= SURE_UNKNOWN
        ):
            return best_match_name, summary, self.image

        # ยังไม่เจอแน่ชัด
        return None, None, None
