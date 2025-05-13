from fastapi import Form, File, UploadFile, APIRouter

from app.services.detection import DetectionService

router = APIRouter(prefix="/detection", tags=["Detection"])


@router.post("/track_faces")
async def track_faces(
    admin_id: str = Form(...),
    work_start_time: int = Form(...),
    file: UploadFile = File(...),
):
    result = await DetectionService.track_faces(admin_id, work_start_time, file)
    return result
