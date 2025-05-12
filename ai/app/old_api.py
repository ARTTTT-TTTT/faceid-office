# api.py
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from app.services.detection import load_known_face, tracking_face
from pydantic import BaseModel
from app.services.compress import compress_all_person, compress_single_image
from fastapi import FastAPI, UploadFile, File
import cv2
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import base64

app = FastAPI()

origins = [
    "http://localhost:3000",
]

# !DEV ONLY
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# config
# known_faces_dir = r'D:\Project\FastAPI\FaceDetectedAPI\data\person_npy'
video_path = r"D:\Project\FastAPI\FaceDetectedAPI\data\MotherPun2.mp4"

# โหลดข้อมูล face
# known_faces = load_known_face(known_faces_dir)


@app.get("/")
def root():
    return {"message": "Face Recognition API is running"}


# @app.post("/track_faces")
# async def track_faces(file: UploadFile = File(...)):
#     body = await request.body()
#     result = tracking_face(body)
#     return {"detected_faces": result[1]}


@app.post("/track_faces")
async def track_faces(file: UploadFile = File(...)):
    content = await file.read()

    print(f"Filename: {file.filename}")
    print(f"Content type: {file.content_type}")

    frame = None

    if file.content_type == "image/jpeg":
        nparr = np.frombuffer(content, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"error": "Failed to decode image"}

    # cv2.imwrite("/Users/natthanichasamanchat/Documents/ART/Development/GitHub/FaceID-Office/ai/result/output.jpeg", frame)

    result = tracking_face(frame)
    return {"message": "Face tracking completed.", "result": result}


# @app.get("/tf")
# def track_faces():
#     result = tracking_face(video_path)
#     return {"detected_faces": result[1]}


class CompressRequest(BaseModel):
    input_image_dir: str
    output_npy_dir: str


# {
#   "input_image_dir": "D:\\Project\\FastAPI\\FaceDetectedAPI\\data\\person_img",
#   "output_npy_dir": "D:\\Project\\FastAPI\\FaceDetectedAPI\\data\\person_npy"
# }


@app.post("/compress")
def compress_images(request: CompressRequest):
    try:
        compress_all_person(
            request.input_image_dir, request.output_npy_dir
        )  # ✅ ตรงกับ class
        return {"message": "Compression completed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/single_compress")
def compress_images(request: CompressRequest):
    try:

        # input เข้าไปถึงชื่อ Folderperson ของแต่ละคน ..//pathpath_to//person_img/
        # output เข้าไปถึงชื่อ Folderperson ของแต่ละคน เช่น ...//path_to//person_npy//person1/
        compress_single_image(
            request.input_image_dir, request.output_npy_dir
        )  # ✅ ตรงกับ class
        return {"message": "Compression completed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
