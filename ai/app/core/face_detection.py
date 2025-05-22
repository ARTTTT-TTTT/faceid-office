# face_detection.py - คลาสสำหรับการตรวจจับใบหน้า
"""
รับผิดชอบการตรวจจับใบหน้าในภาพโดยใช้ YOLO และการแยกตำแหน่งใบหน้า
"""
from ultralytics import YOLO


class FaceDetector:
    def __init__(self, config):
        """
        ตั้งค่าตัวตรวจจับใบหน้า

        Args:
            config: อ็อบเจ็กต์การตั้งค่าแอปพลิเคชัน
        """
        self.model_YOLO = YOLO(config.yolo_model_path)
        self.threshold = config.yolo_threshold

    def detect(self, frame):
        """
        ตรวจจับใบหน้าในเฟรม

        Args:
            frame: ภาพเฟรมที่ต้องการตรวจจับ

        Returns:
            ผลลัพธ์การตรวจจับจาก YOLO
        """
        results = self.model_YOLO.predict(
            source=frame, conf=self.threshold, verbose=False
        )
        return results[0]

    def extract_faces(self, frame, detections):
        """
        แยกตำแหน่งและภาพใบหน้าจากผลการตรวจจับ

        Args:
            frame: ภาพเฟรมต้นฉบับ
            detections: ผลลัพธ์การตรวจจับจาก YOLO

        Returns:
            positions: รายการตำแหน่งกึ่งกลางของใบหน้า [(x, y), ...]
            faces: รายการภาพใบหน้าที่ตัดแยก
        """
        positions, faces = [], []
        for box in detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            faces.append(frame[y1:y2, x1:x2])
            positions.append(((x1 + x2) // 2, (y1 + y2) // 2))
        return positions, faces

    def draw_detections(self, frame, detections):
        """
        วาดกรอบและข้อมูลการตรวจจับบนเฟรม

        Args:
            frame: ภาพเฟรมต้นฉบับ
            detections: ผลลัพธ์การตรวจจับจาก YOLO

        Returns:
            annotated_frame: เฟรมที่มีการวาดกรอบและข้อมูลแล้ว
        """
        return detections.plot()
