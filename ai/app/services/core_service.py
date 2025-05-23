import cv2
import numpy as np

from fastapi import HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.constants.core_config import CoreConfig


class CoreService:
    core_config = CoreConfig()

    @classmethod
    async def face_identification(cls, file: UploadFile) -> JSONResponse:
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

            return {"message": "success"}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred during face identification: {str(e)}",
            )


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
