from fastapi import Form, File, UploadFile, APIRouter

from app.services.core_service import CoreService


router = APIRouter(prefix="/core", tags=["CORE"])


@router.post("/face-identification")
async def face_identification(
    file: UploadFile = File(...),
):
    result = await CoreService.face_identification(file)
    return result
