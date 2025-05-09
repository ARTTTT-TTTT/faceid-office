# api.py
from fastapi import FastAPI, HTTPException
from numpy import compress
from processing import load_known_face, tracking_face
from pydantic import BaseModel
from compress  import compress_all_person,compress_single_image
from pydantic import BaseModel

app = FastAPI()

# config
# known_faces_dir = r'D:\Project\FastAPI\FaceDetectedAPI\data\person_npy'
video_path = r"D:\Project\FastAPI\FaceDetectedAPI\data\MotherPun2.mp4"

# โหลดข้อมูล face
# known_faces = load_known_face(known_faces_dir)

@app.get("/")
def root():
    return {"message": "Face Recognition API is running"}

class VideoRequest(BaseModel):
    video_path: str #base64
@app.post("/track_faces")
def track_faces(request:VideoRequest):
    result = tracking_face(request.video_path)
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
