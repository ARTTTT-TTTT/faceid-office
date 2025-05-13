from fastapi import Form, File, UploadFile, APIRouter, HTTPException

from app.services.detection import DetectionService
from app.services.compress import compress_all_person
from app.models.detection import CompressPayload


router = APIRouter(prefix="/detections", tags=["Detection"])


@router.post("/track_faces")
async def track_faces(
    admin_id: str = Form(...),
    work_start_time: int = Form(...),
    file: UploadFile = File(...),
):
    result = await DetectionService.track_faces(admin_id, work_start_time, file)
    return result


@router.post("/compress")
def compress_images(payload: CompressPayload):
    try:
        compress_all_person(payload.input_image_dir, payload.output_npy_dir)
        return {"message": "Compression completed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
