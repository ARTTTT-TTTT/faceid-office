import os
import cv2
import numpy as np

from PIL import Image
from ultralytics import YOLO
from datetime import datetime
from torchvision import transforms
from scipy.spatial.distance import cosine
from facenet_pytorch import InceptionResnetV1
from fastapi import HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.database.redis import redis_client
from app.constants.settings import settings
from app.models.user_log import UserLogStatus
from app.services.user_log import UserLogService


class DetectionService:
    admin_prefix = settings.ADMIN_PREFIX
    tracking_suffix = settings.TRACKING_SUFFIX

    @classmethod
    def build_marker_key(cls, admin_id: str) -> str:
        return f"{cls.admin_prefix}:{admin_id}:{cls.tracking_suffix}"

    @classmethod
    async def track_faces(
        cls, admin_id: str, work_start_time: int, file: UploadFile
    ) -> JSONResponse:
        marker_key = cls.build_marker_key(admin_id)
        if not redis_client.exists(marker_key):
            return JSONResponse(
                content={"result": "Not in session time."}, status_code=202
            )
        try:
            if file.content_type != "image/jpeg":
                raise HTTPException(
                    status_code=400, detail="Only JPEG images are supported."
                )

            content = await file.read()
            frame = cv2.imdecode(np.frombuffer(content, np.uint8), cv2.IMREAD_COLOR)

            if frame is None:
                raise HTTPException(
                    status_code=400, detail="Failed to decode the image."
                )

            result = DetectionProcessingService.tracking_face(
                frame, admin_id, work_start_time
            )

            if result["status"] == "new_log":
                return JSONResponse(
                    content={"result": result["message"]}, status_code=201
                )
            else:
                return JSONResponse(
                    content={"result": result["message"]}, status_code=200
                )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to track faces: {str(e)}"
            )


class DetectionProcessingService:

    # ==== DIRECTORIES ====
    base_dir = os.getcwd()
    yolo_model_path = os.path.join(base_dir, "app/models", settings.YOLO_MODEL)
    known_faces_path = os.path.join(base_dir, "app/data", settings.KNOWN_FACES)

    # ==== LOAD MODELS ====
    model_face_detector = YOLO(yolo_model_path)
    model_face_embedder = InceptionResnetV1(
        pretrained=settings.FACE_EMBEDDER_MODEL
    ).eval()

    # ==== DEFINE ====
    transform = transforms.Compose(
        [
            transforms.Resize((160, 160)),
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5]),
        ]
    )

    @classmethod
    def load_known_face(cls):
        known_faces = {}
        for person_folder in os.listdir(cls.known_faces_path):
            person_folder_path = os.path.join(cls.known_faces_path, person_folder)
            if os.path.isdir(person_folder_path):
                person_faces = {}
                for filename in os.listdir(person_folder_path):
                    if filename.endswith(".npy"):
                        name = os.path.splitext(filename)[0]
                        path = os.path.join(person_folder_path, filename)
                        person_faces[name] = np.load(path)
                known_faces[person_folder] = person_faces
        return known_faces

    @classmethod
    def image_embedding(cls, cropped_image):
        cropped_pil = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))
        img_tensor = cls.transform(cropped_pil).unsqueeze(0)
        embedding = cls.model_face_embedder(img_tensor)
        embedding_np = embedding.detach().numpy()[0]
        return embedding_np

    @staticmethod
    def rotation_camera(frame, direction=None):
        if direction == "L":
            frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
        if direction == "R":
            frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
        if direction == "F":
            frame = cv2.rotate(frame, cv2.ROTATE_180)
        return frame

    @classmethod
    def tracking_face(cls, frame, admin_id, work_start_time):
        known_faces = cls.load_known_face()

        results = cls.model_face_detector.predict(
            source=frame, conf=settings.CONFIDENCE_THRESHOLD, verbose=False
        )
        detections = results[0]

        if not detections.boxes:
            return {"status": "no_face", "message": "No faces detected in this frame."}

        for box in detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cropped = frame[y1:y2, x1:x2]
            vector_image = cls.image_embedding(cropped)

            person_distances = {}
            for person_folder, person_faces in known_faces.items():
                distances = []
                for name, known_embedding in person_faces.items():
                    distance = cosine(vector_image, known_embedding)
                    distances.append((name, distance))
                min_name, min_dist = min(distances, key=lambda x: x[1])
                person_distances[person_folder] = (min_name, min_dist)

            best_person, (_, best_distance) = min(
                person_distances.items(), key=lambda x: x[1][1]
            )

            if best_distance < settings.BEST_DISTANCE_THRESHOLD:
                if UserLogService.should_log_user(name=best_person, admin_id=admin_id):
                    now = datetime.now()
                    status = (
                        UserLogStatus.ON_TIME
                        if now.hour < work_start_time
                        else UserLogStatus.LATE
                    )
                    result = UserLogService.save_user_log(
                        name=best_person, status=status
                    )

                    if result == False:
                        return {
                            "status": "error",
                            "message": "Failed to save user log.",
                        }

                    return {"status": "new_log", "message": best_person}
                else:
                    return {
                        "status": "already_logged",
                        "message": "Already logged in this session.",
                    }

        return {"status": "no_match", "message": "No recognized faces."}
