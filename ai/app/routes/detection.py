import cv2
import numpy as np

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse

from app.services.detection import tracking_face

router = APIRouter(prefix="/detection", tags=["Detection"])

@router.post("/track_faces")
async def track_faces(file: UploadFile = File(...)):
    try:
        if file.content_type != "image/jpeg":
            raise HTTPException(status_code=400, detail="Only JPEG images are supported.")

        content = await file.read()
        frame = cv2.imdecode(np.frombuffer(content, np.uint8), cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Failed to decode the image.")

        result = tracking_face(frame)

        if result["status"] == "new_log":
            return JSONResponse(content={"result": result["message"]}, status_code=201)
        else:
            return JSONResponse(content={"result": result["message"]}, status_code=200)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")