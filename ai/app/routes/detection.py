import cv2
import numpy as np

from fastapi import APIRouter, HTTPException, UploadFile, File
from app.lib.detection import tracking_face

router = APIRouter(prefix="/detection", tags=["detection"])

@router.post("/track_faces")
async def track_faces(file: UploadFile = File(...)):
    content = await file.read()
    frame = None

    if file.content_type == "image/jpeg":
        nparr = np.frombuffer(content, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
        if frame is None:
          return {"error": "Failed to decode image"}

    result = tracking_face(frame)
    
    return {"message": "Face tracking completed.", "result": result}