import os
import cv2
from ultralytics import YOLO
import numpy as np
from facenet_pytorch import InceptionResnetV1
from PIL import Image
from torchvision import transforms
from scipy.spatial.distance import cosine
import time
import base64
from io import BytesIO
import time
from datetime import datetime
# ==== Load Video ====
video_path = 'D:/Project/FaceDetect/.venv/data/walk.mp4' # Multiple people
video_path1 = r'D:\Project\FaceDetect\.venv\data\PVideo.MOV' # pun with glasses
video_path1 = r'D:\Project\FaceDetect\.venv\data\PUNVideo.MOV' # pun
video_path2 = r'D:\Project\FaceDetect\.venv\data\PVideo.MOV' # p
video_path3 = r'D:\Project\FaceDetect\.venv\data\ArtVideo.MOV' # aet
video_path4 = r'D:\Project\FaceDetect\.venv\data\a8.mp4' # chatcard
video_path5 = r'D:\Project\FaceDetect\.venv\data\a9.mp4' # chatcard fad
video_path6 = r'D:\Project\FaceDetect\.venv\data\a10.mp4' # chatchart twin
video_path7 = r"D:\Project\FaceDetect\.venv\data\MotherPun2.mp4"
video_path8 = r"D:\Project\FaceDetect\.venv\data\face4.mp4"

# ==== Load known faces ====
# known_faces_dir = r'model_dir\data\person_npy'

# path ของโฟลเดอร์ที่ไฟล์นี้อยู่

current_directory = os.getcwd()

# ตรวจสอบว่าโปรแกรมทำงานอยู่ที่ไหน

print(f"Current Directory: {current_directory}")


# path ไปยัง model/
model_dir = os.path.join(current_directory, 'models',"yolov11l-face.pt")
known_faces_dir = os.path.join(current_directory, 'data',"person_npy")


def load_known_face(known_faces_dir) :
    known_faces = {}
    for person_folder in os.listdir(known_faces_dir):
        person_folder_path = os.path.join(known_faces_dir, person_folder)
        if os.path.isdir(person_folder_path):
            person_faces = {}
            for filename in os.listdir(person_folder_path):
                if filename.endswith('.npy'):
                    name = os.path.splitext(filename)[0]
                    path = os.path.join(person_folder_path, filename)
                    person_faces[name] = np.load(path)
            known_faces[person_folder] = person_faces
            # print(f"Loaded {len(person_faces)} faces for {person_folder}")
    print('loaded')
    return known_faces

# ==== Load models ====
model = YOLO(model_dir)
model_face = InceptionResnetV1(pretrained='vggface2').eval()

# ===  define  ===
transform = transforms.Compose([
    transforms.Resize((160, 160)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])
# ==== Define ====
confidence_threshold = 0.8
track_old_face = [] #หน้าที่เจอทั้งหมดใน คลิป
# ฟังก์ชันแปลงภาพจาก OpenCV (BGR) เป็น Base64
def image_to_base64(img):
    # เปลี่ยนจาก BGR (OpenCV) เป็น RGB (PIL)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(img_rgb)

    # แปลงเป็น BytesIO object
    buffered = BytesIO()
    pil_image.save(buffered, format="PNG")

    # แปลงเป็น base64
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_base64
# ====   FUNCTION    ====
def image_embedding(cropped_image):
    cropped_pil = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))
    img_tensor = transform(cropped_pil).unsqueeze(0)
    embedding = model_face(img_tensor)
    embedding_np = embedding.detach().numpy()[0]
    return embedding_np

def rotation_camera(frame,direction=None):
    # ==== Rotation ====
    if direction == "L":
        frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
    if direction == "R":
        frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
    if direction == 'F':
        frame = cv2.rotate(frame, cv2.ROTATE_180)
    return frame

def tracking_face(video_path):
    known_faces = load_known_face(known_faces_dir)
    # cap = cv2.VideoCapture(video_path)

    # ==== Prediction ====
    results = model.predict(source=video_path, conf=confidence_threshold, verbose=False)
    detections = results[0]
    # annotated_frame = detections.plot()

    # ==== Detected ====
    if not detections.boxes:
        return "No faces detected in this frame."
    else:
        track_current_frame = []
        for box in detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cropped = video_path[y1:y2, x1:x2]
            
            # แปลง cropped face เป็น embedding
            vector_image = image_embedding(cropped_image=cropped)
            # print('vec:',vector_image)
            # เก็บ distance per person, per image
            person_distances = {}

            for person_folder, person_faces in known_faces.items():
                distances = []
                for name, known_embedding in person_faces.items():
                    distance = cosine(vector_image, known_embedding)
                    distances.append((name, distance))
                min_name, min_dist = min(distances, key=lambda x: x[1])
                person_distances[person_folder] = (min_name, min_dist)

            #best_folder ชื่อคน best_name ชื่อ files ที่อยู่ใน Folder
            best_folder, (best_name, best_distance) = min(person_distances.items(), key=lambda x: x[1][1])
            # print(best_distance,type(best_distance))
            if best_distance < 0.25:
                track_current_frame.append(best_folder)
                # name_result = best_folder
                # print('Best Folder : ', best_folder, 'best_distance :', best_distance, 'center_x :', center_x , 'center_y:', center_y)
                # ==== UPDATE track_old_face ====

                found = False
                for person in track_old_face:
                    if person["name_person"] == best_folder:
                        break

                if not found:
                    track_old_face.append({
                        "name_person": best_folder,
                    })
                results_path = r"results"+f"/{best_folder}"
                if not os.path.exists(results_path):
                    print("Folder ยังไม่มี! จะสร้างใหม่ให้...")
                    os.makedirs(os.path.join(current_directory,results_path))
                else:
                    print("Folder มีอยู่แล้ว!")

                best_result_path = os.path.join(results_path, best_folder) #name file
                
                found_day = datetime.now().strftime('%Y-%m-%d')
                found_time = datetime.now().strftime('%H-%M')

                picture_path = f"{best_result_path}_{found_time}_{found_day}"
                if os.path.exists(f"{picture_path}.jpg"):
                    print("picture_path",picture_path)
                    cv2.imwrite(f'{picture_path}.jpg', cropped)
                else:
                    cv2.imwrite(f'{picture_path}.jpg', cropped)
                new_update_log = f"name_person: {best_folder} ป/ด/ว: {found_day} เวลา(ชม/นาที): {found_time}"
                if os.path.exists(f"{best_result_path}.txt"):
                    with open(f"{best_result_path}.txt", 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        last = lines[-1].strip() if lines else ''  # ใช้ strip() เพื่อให้ลบการเว้นช่องว่างหรือการขึ้นบรรทัดใหม่
                        print("last:", type(last))
                        print("new_update_log:", type(new_update_log))
                        print("check :",last == new_update_log)
                        if f"{last}" == new_update_log:
                            print("overwrite")  # ถ้าบรรทัดสุดท้ายเหมือนกับใหม่ก็จะไม่เขียนซ้ำ
                        else:
                            with open(f"{best_result_path}.txt", 'a', encoding='utf-8') as f:
                                f.write(f"{new_update_log}\n")
                else:
                    with open(f"{best_result_path}.txt", 'w', encoding='utf-8') as f:
                        f.write(f"{new_update_log}\n")
                # ==== Debug print ====
                print("Faces detected in this frame:")
                for name in track_current_frame:
                  #print(f"  {name}")
                  return name
                    
                
        print(f"{track_current_frame}")
        print("=======================================================")
