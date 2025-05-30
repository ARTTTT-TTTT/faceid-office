from ultralytics import YOLO
from app.configs.core_config import CoreConfig


class FaceDetection:
    def __init__(self):
        self.config = CoreConfig()
        self.model_YOLO = YOLO(self.config.yolo_model_path)

    def detect_faces(self, frame):
        """Detect faces in frame using YOLO model"""
        results = self.model_YOLO.predict(
            source=frame, conf=self.config.yolo_threshold, verbose=False
        )
        return results[0]

    def extract_faces_and_positions(self, frame, detections):
        """Extract face images and their center positions from detections"""
        positions, faces = [], []
        for box in detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            faces.append(frame[y1:y2, x1:x2])
            positions.append(((x1 + x2) // 2, (y1 + y2) // 2))
        return positions, faces
