# import numpy as np
# import httpx
# from fastapi import HTTPException

# from app.core.face_tracking import face_tracking
# from app.constants.app_config import settings as app_settings


# class DetectionService:
#     def __init__(self):
#         face_tracking.load_faiss_index()

#     def process_frame(self, frame: np.ndarray):


#     # if person_id == "Unknown":
#     #     return {
#     #         "status": "unknown",
#     #         "message": "No recognized faces or not enough confidence.",
#     #     }
#     # elif person_id:
#     #     if redis_service.check_detection_log(admin_id, person_id=person_id):
#     #         detection_url = f"{app_settings.SERVER_URL}/detection-logs"
#     #         payload = {
#     #             "personId": person_id,
#     #             "cameraId": camera_id,
#     #             "sessionId": session_id,
#     #         }

#     #         try:
#     #             async with httpx.AsyncClient() as client:
#     #                 response = await client.post(
#     #                     detection_url, json=payload, timeout=5.0
#     #                 )
#     #                 if response.status_code in [200, 201]:
#     #                     return {
#     #                         "status": "new_log",
#     #                         "message": person_id,
#     #                     }
#     #                 else:
#     #                     return {
#     #                         "status": "failed_detection-logs",
#     #                         "message": {response.text},
#     #                     }
#     #         except Exception as e:
#     #             raise HTTPException(
#     #                 status_code=500,
#     #                 detail=f"Failed to detection logs admin:{admin_id} person:{person_id} {str(e)}",
#     #             )
#     #     else:
#     #         return {
#     #             "status": "already_logged",
#     #             "message": "Already logged in this session.",
#     #         }
#     # else:
#     #     return {"status": "no_face", "message": "No face detected in the frame."}


# detection_service = DetectionService()
