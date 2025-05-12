import cv2
import numpy as np

from fastapi import APIRouter, UploadFile, File

from app.services.detection import DetectionService

router = APIRouter(prefix="/detection", tags=["Detection"])


@router.post("/track_faces")
async def track_faces(admin_id: str, file: UploadFile = File(...)):
    result = await DetectionService.track_faces(admin_id, file)
    return result
