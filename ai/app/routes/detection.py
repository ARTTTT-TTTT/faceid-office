from fastapi import APIRouter, UploadFile, File

from app.services.detection import DetectionService

router = APIRouter(prefix="/detection", tags=["Detection"])


@router.post("/track_faces")
async def track_faces(
    admin_id: str, work_start_time: int, file: UploadFile = File(...)
):
    result = await DetectionService.track_faces(admin_id, work_start_time, file)
    return result
