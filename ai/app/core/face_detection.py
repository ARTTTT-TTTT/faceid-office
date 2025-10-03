from ultralytics import YOLO
from app.configs.core_config import CoreConfig


class FaceDetection:
    def __init__(self, core_config: CoreConfig):
        self.core_config = core_config
        try:
            self.model_YOLO = YOLO(self.core_config.yolo_model_path).half()
        except Exception as e:
            raise RuntimeError(
                f"Failed to load YOLO model from {self.core_config.yolo_model_path}: {e}"
            )

    def detect_faces(self, frame):
        """Detect faces in frame using YOLO model"""
        try:
            results = self.model_YOLO.predict(
                source=frame,
                conf=self.core_config.yolo_threshold,
                classes=[0],
                verbose=False,
                device=self.core_config.default_device,
            )
            res = results[0]

            # If there are multiple boxes, keep only the largest by area
            try:
                boxes_xyxy = res.boxes.xyxy if hasattr(res, "boxes") else None
                if boxes_xyxy is not None and len(boxes_xyxy) > 0:
                    # Compute areas: (x2 - x1) * (y2 - y1)
                    areas = (boxes_xyxy[:, 2] - boxes_xyxy[:, 0]) * (
                        boxes_xyxy[:, 3] - boxes_xyxy[:, 1]
                    )
                    max_idx = int(areas.argmax().item())
                    # Retain only the largest box
                    res.boxes.data = res.boxes.data[max_idx : max_idx + 1]
            except Exception as inner_e:
                # Fall back to original results if filtering fails
                print(f"[WARN] Failed to filter to largest box: {inner_e}")

            return res
        except Exception as e:
            print(f"[ERROR] Face detection failed: {e}")
            return None

    async def extract_faces_and_positions(self, frame, detections):
        """Extract face images and their center positions from detections"""
        if detections is None or not detections.boxes:
            return [], []

        positions, faces = [], []
        try:
            for box in detections.boxes:
                x1, y1, x2, y2 = map(int, list(box.xyxy[0]))
                face = frame[y1:y2, x1:x2]
                faces.append(face)
                positions.append(((x1 + x2) // 2, (y1 + y2) // 2))
        except Exception as e:
            print(f"[ERROR] Failed to extract faces and positions: {e}")

        return positions, faces
