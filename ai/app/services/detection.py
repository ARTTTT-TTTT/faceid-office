import os
import cv2
import numpy as np

from PIL import Image
from ultralytics import YOLO
from datetime import datetime
from torchvision import transforms
from scipy.spatial.distance import cosine
from facenet_pytorch import InceptionResnetV1

from app.constants.settings import settings
from app.models.user_log import UserLogStatus
from app.services.user_log import save_user_log, should_log_user

# ==== DIRECTORIES ====
base_dir = os.getcwd()
yolo_model_path = os.path.join(base_dir, 'app/models',settings.YOLO_MODEL)
known_faces_path = os.path.join(base_dir, 'app/data',settings.KNOWN_FACES)

# ==== LOAD MODELS ====
model_face_detector = YOLO(yolo_model_path )
model_face_embedder = InceptionResnetV1(pretrained=settings.FACE_EMBEDDER_MODEL).eval()

# ==== DEFINE ====
transform = transforms.Compose([
    transforms.Resize((160, 160)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])

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

def tracking_face(frame):
    known_faces = load_known_face(known_faces_path)

    results = model_face_detector.predict(
        source=frame,
        conf=settings.CONFIDENCE_THRESHOLD,
        verbose=False
    )
    detections = results[0]

    if not detections.boxes:
        return {
            "status": "no_face",
            "message": "No faces detected in this frame."
        }

    for box in detections.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        cropped = frame[y1:y2, x1:x2]
        vector_image = image_embedding(cropped)

        person_distances = {}
        for person_folder, person_faces in known_faces.items():
            distances = []
            for name, known_embedding in person_faces.items():
                distance = cosine(vector_image, known_embedding)
                distances.append((name, distance))
            min_name, min_dist = min(distances, key=lambda x: x[1])
            person_distances[person_folder] = (min_name, min_dist)

        best_person, (_, best_distance) = min(person_distances.items(), key=lambda x: x[1][1])

        if best_distance < settings.BEST_DISTANCE_THRESHOLD:
            if should_log_user(best_person):
                now = datetime.now()
                status = UserLogStatus.on_time if now.hour < settings.WORK_START_TIME else UserLogStatus.late
                save_user_log(name=best_person, status=status)

                return {
                    "status": "new_log",
                    "message": best_person
                }
            else:
                return {
                    "status": "already_logged",
                    "message": "Already logged in this session."
                }

    return {
        "status": "no_match",
        "message": "No recognized faces."
    }
