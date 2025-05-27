import cv2
import numpy as np

from app.constants.core_config import CoreConfig
from app.core.face_tracking import FaceTracking


class CoreService:
    core_config = CoreConfig()

    def __init__(self):
        self.tracker = FaceTracking()
        self.tracker.load_faiss_index()

    def _process_frame(self, frame: np.ndarray):
        person_id = self.tracker.tracking_face(frame)
        if person_id is None:
            return "None"
        print(person_id)
        return person_id

    def process_frame(self, frame: np.ndarray):
        annotated_frame = self.tracker.tracking_face(frame)
        _, buffer = cv2.imencode(".jpg", annotated_frame)
        return buffer.tobytes()


core_service = CoreService()


# class DetectionProcessingService:
#     @classmethod
#     def face_identification(cls, frame, admin_id,camera_id, ):

#                 # !FEATURE RedisService Find user ถ้ามี อยู่แล้ว ให้ Already ถ้าไม่มีให้ ยิง API

#                 if detected:
#                     if RedisService.check_detection_log(
#                       admin_id=admin_id, camera_id=camera_id, person_id=best_person
#                   ):
#                         # !FEATURE [API] POST api/detection-logs(personId,cameraId,sessionId,)

#                         return {"status": "new_log", "message": best_person}
#                 else:
#                     return {
#                         "status": "already_logged",
#                         "message": "Already logged in this session.",
#                     }

#         return {"status": "no_match", "message": "No recognized faces."}
