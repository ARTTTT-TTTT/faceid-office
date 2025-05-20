from fastapi import Form, File, UploadFile, APIRouter, HTTPException

from app.services.detection import DetectionService


router = APIRouter(prefix="/detections", tags=["Detection"])


@router.post("/face-identification")
async def face_identification(
    admin_id: str = Form(...),
    camera_id: str = Form(...),
    session_id: str = Form(...),
    file: UploadFile = File(...),
):
    result = await DetectionService.face_identification(
        admin_id, camera_id, session_id, file
    )
    return result
