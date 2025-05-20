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

from app.constants.config import settings

from app.services.redis import RedisService


class DetectionService:

    @classmethod
    async def face_identification(
        cls, admin_id:str,  camera_id:str, session_id:str, file: UploadFile
    ) -> JSONResponse:
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

            result = DetectionProcessingService.face_identification(
                frame, admin_id,camera_id,
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
    def face_identification(cls, frame, admin_id,camera_id, ):

                # !FEATURE RedisService Find user ถ้ามี อยู่แล้ว ให้ Already ถ้าไม่มีให้ ยิง API

        #         if detected:
        #             if RedisService.check_detection_log(
        #               admin_id=admin_id, camera_id=camera_id, person_id=best_person
        #           ):
        #                 # !FEATURE [API] POST api/detection-logs(personId,cameraId,sessionId,)

        #                 return {"status": "new_log", "message": best_person}
        #         else:
        #             return {
        #                 "status": "already_logged",
        #                 "message": "Already logged in this session.",
        #             }

        # return {"status": "no_match", "message": "No recognized faces."}


# Not in session time.
# Failed to save user log.
# Already logged in this session.
# No recognized faces.