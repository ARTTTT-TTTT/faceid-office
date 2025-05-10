import os
import cv2
import time
import numpy as np

from PIL import Image
from ultralytics import YOLO
from datetime import datetime
from torchvision import transforms
from scipy.spatial.distance import cosine
from facenet_pytorch import InceptionResnetV1

# ==== DIRECTORIES ====
base_dir = os.getcwd()
yolo_model_path = os.path.join(base_dir, 'app/models',"yolov11l-face.pt")
known_faces_path = os.path.join(base_dir, 'app/data',"person_npy")

# ==== LOAD MODELS ====
model_face_detector = YOLO(yolo_model_path )
model_face_embedder = InceptionResnetV1(pretrained='vggface2').eval()

# ==== DEFINE ====
transform = transforms.Compose([
    transforms.Resize((160, 160)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])
confidence_threshold = 0.8

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
    return known_faces

def image_embedding(cropped_image):
    cropped_pil = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))
    img_tensor = transform(cropped_pil).unsqueeze(0)
    embedding = model_face_embedder(img_tensor)
    embedding_np = embedding.detach().numpy()[0]
    return embedding_np

def rotation_camera(frame,direction=None):
    if direction == "L":
        frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
    if direction == "R":
        frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
    if direction == 'F':
        frame = cv2.rotate(frame, cv2.ROTATE_180)
    return frame

def tracking_face(video_path):
    known_faces = load_known_face(known_faces_path)

    # ==== PREDICTION ====
    results = model_face_detector.predict(source=video_path, conf=confidence_threshold, verbose=False)
    detections = results[0]

    # ==== DETECTED ====
    if not detections.boxes:
        return "No faces detected in this frame."
    else:
        track_current_frame = []
        for box in detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cropped = video_path[y1:y2, x1:x2]
            
            # แปลง cropped face เป็น embedding
            vector_image = image_embedding(cropped_image=cropped)
            
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
                
                # ==== UPDATE track_old_face ====

                found = False
                track_old_face = []
                
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
                    os.makedirs(os.path.join(base_dir,results_path))
                else:
                    print("Folder มีอยู่แล้ว!")

                best_result_path = os.path.join(results_path, best_folder)
                
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
                        last = lines[-1].strip() if lines else ''
                        print("last:", type(last))
                        print("new_update_log:", type(new_update_log))
                        print("check :",last == new_update_log)
                        if f"{last}" == new_update_log:
                            print("overwrite")
                        else:
                            with open(f"{best_result_path}.txt", 'a', encoding='utf-8') as f:
                                f.write(f"{new_update_log}\n")
                else:
                    with open(f"{best_result_path}.txt", 'w', encoding='utf-8') as f:
                        f.write(f"{new_update_log}\n")
                        
                # ==== DEBUG PRINT ====
                print("Faces detected in this frame:")
                for name in track_current_frame:
                  return name
                
        print(f"{track_current_frame}")
        print("=======================================================")
