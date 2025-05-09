# api.py
from fastapi import FastAPI, HTTPException,Request, UploadFile, File
import numpy as np
from processing import load_known_face, tracking_face
from pydantic import BaseModel
from compress  import compress_all_person,compress_single_image
from pydantic import BaseModel
import cv2
app = FastAPI()

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
async def track_faces(request: Request):
    body = await request.body()  # รับ blob (bytes) ของ jpeg
    np_array = np.frombuffer(body, np.uint8)  # แปลง bytes เป็น numpy array
    frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)  # decode jpeg เป็น OpenCV image
    
    if frame is None:
        return {"error": "Could not decode image"}
    
    result = tracking_face(frame)  # ส่ง frame ไปประมวลผลแทน video_path
    return {"detected_faces": result}

@app.get("/tf")
def track_faces():
    result = tracking_face(video_path)
    return {"detected_faces": result[1]}


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
        compress_all_person(request.input_image_dir, request.output_npy_dir)  # ✅ ตรงกับ class
        return {"message": "Compression completed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/single_compress")
def compress_images(request: CompressRequest):
    try:

        #input เข้าไปถึงชื่อ Folderperson ของแต่ละคน ..//pathpath_to//person_img/
        #output เข้าไปถึงชื่อ Folderperson ของแต่ละคน เช่น ...//path_to//person_npy//person1/
        compress_single_image(request.input_image_dir, request.output_npy_dir)  # ✅ ตรงกับ class
        return {"message": "Compression completed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
