import cv2
import numpy as np

from fastapi import APIRouter, HTTPException, UploadFile, File
from app.lib.detection import tracking_face

router = APIRouter(prefix="/detection", tags=["detection"])

@router.post("/track_faces")
async def track_faces(file: UploadFile = File(...)):
    try:
        if file.content_type != "image/jpeg":
            raise HTTPException(status_code=400, detail="Only JPEG images are supported.")

        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Failed to decode the image.")

        result = tracking_face(frame)

        return {"result": result}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
