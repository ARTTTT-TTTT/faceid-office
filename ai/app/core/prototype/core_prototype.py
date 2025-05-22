import os
import cv2
import faiss
import numpy as np

from PIL import Image
from ultralytics import YOLO
from collections import Counter
from facenet_pytorch import InceptionResnetV1
from langchain.embeddings.base import Embeddings
from langchain_community.vectorstores import FAISS

from app.constants.core_config import CoreConfig
from app.utils.transform_factory import face_transform

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"


class FaceBlob:
    def __init__(self, id, position, image=None):
        self.id = id
        self.position = position
        self.image = image
        self.life = DetectionProcessingService.LIFE_TIME
        self.matched_person_name = None
        self.match_history = {}
        self.kalman = cv2.KalmanFilter(4, 2)
        self.kalman.measurementMatrix = np.array(
            [[1, 0, 0, 0], [0, 1, 0, 0]], np.float32
        )
        self.kalman.transitionMatrix = np.array(
            [[1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 1, 0], [0, 0, 0, 1]], np.float32
        )
        self.kalman.processNoiseCov = np.eye(4, dtype=np.float32) * 0.03
        initial_state = np.array(
            [[position[0]], [position[1]], [0], [0]], dtype=np.float32
        )
        self.kalman.statePre = initial_state.copy()
        self.kalman.statePost = initial_state.copy()

    def predict_position(self):
        prediction = self.kalman.predict()
        return int(prediction[0, 0]), int(prediction[1, 0])

    def update(self, position, image, matched_person_name):
        self.position = position
        self.image = image
        self.life = DetectionProcessingService.LIFE_TIME

        self.kalman.correct(np.array([[position[0]], [position[1]]], dtype=np.float32))

        self.matched_person_name = matched_person_name
        self.match_history[matched_person_name] = (
            self.match_history.get(matched_person_name, 0) + 1
        )

    def get_match_summary(self):
        SURE_KNOW = 5
        SURE_UNKNOWN = 5
        summary = ", ".join(f"{k}: {v}" for k, v in self.match_history.items())
        valid_named = {
            name: count
            for name, count in self.match_history.items()
            if name != "Unknown" and count >= SURE_KNOW
        }

        best_match_name, best_match_count = (None, 0)
        if valid_named:
            best_match_name, best_match_count = max(
                valid_named.items(), key=lambda x: x[1]
            )

        unknown_count = self.match_history.get("Unknown", 0)

        if unknown_count >= max(SURE_UNKNOWN, best_match_count * 2):
            return "Unknown", summary, self.image

        if (
            best_match_name
            and unknown_count <= best_match_count * 2
            and unknown_count >= SURE_UNKNOWN
        ):
            return best_match_name, summary, self.image

        return None, None, None


class DummyEmbeddings(Embeddings):
    def embed_documents(self, texts):
        return texts

    def embed_query(self, text):
        return text


class DetectionProcessingService:

    def __init__(self):
        """
        Service สำหรับตรวจจับและรู้จำใบหน้า
        """
        self.config = CoreConfig()

        # Load YOLO
        self.model_YOLO = YOLO(self.config.yolo_model_path)

        # Load FaceNet
        self.model_Facenet = InceptionResnetV1(
            pretrained=self.config.face_embedder_model
        ).eval()

        # Thresholds
        self.YOLO_THRESHOLD = self.config.yolo_threshold
        self.FACENET_THRESHOLD = self.config.facenet_threshold

        # Tracking / Matching
        self.LIFE_TIME = self.config.blob_life_time
        self.ID_FACE = 0
        self.BLOBS = []

        # Transform for FaceNet
        self.transform = face_transform()

        # FAISS Index placeholder
        self.index = None
        self.index_ivf = None
        self.id_to_name = {}

    def load_faiss_index(self):
        """
        โหลดฐานข้อมูล FAISS และสร้าง mapping ID → Name
        """
        # โหลด FAISS local database (docstore, index, etc.)
        self.faiss_db = FAISS.load_local(
            self.config.vector_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )

        # โหลด index เดิมจากไฟล์โดยไม่ reconstruct vectors
        self.index = faiss.read_index(self.config.faiss_path)
        self.index_ivf = self.index  # ใช้ index เดิมเลย ไม่ต้องแปลง

        # สร้าง dictionary mapping ID → Name
        self.id_to_name = {}
        docstore = self.faiss_db.docstore._dict
        for idx, value in docstore.items():
            try:
                name = value.metadata.get("name", "Unknown")
                self.id_to_name[int(idx)] = name
            except Exception:
                continue

    def detect_faces(self, frame):
        results = self.model_YOLO.predict(
            source=frame, conf=self.config.yolo_threshold, verbose=False
        )
        return results[0]

    def extract_faces_and_positions(self, frame, detections):
        positions, faces = [], []
        for box in detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            faces.append(frame[y1:y2, x1:x2])
            positions.append(((x1 + x2) // 2, (y1 + y2) // 2))
        return positions, faces

    def image_embedding(self, cropped_image):
        pil_img = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))
        tensor = self.transform(pil_img).unsqueeze(0)
        return self.model_Facenet(tensor).detach().cpu().numpy()[0]

    def find_best_match(self, embedding):
        if self.index is None:
            raise ValueError("FAISS index not loaded.")
        embedding = embedding / np.linalg.norm(embedding)
        distances, indices = self.index_ivf.search(np.array([embedding]), k=3)
        matched_names = [self.id_to_name.get(int(i), "Unknown") for i in indices[0]]
        name_counter = Counter(matched_names)
        if not name_counter:
            return "Unknown"

        most_common_name = name_counter.most_common(1)[0][0]
        if distances[0][0] < self.config.facenet_threshold:
            return most_common_name
        else:
            return "Unknown"

    def match_or_create_blob(self, pos, face, person, matched_ids):
        for blob in self.BLOBS:
            if self.is_near(blob.predict_position(), pos):
                blob.update(
                    position=pos,
                    image=face,
                    matched_person_name=person or blob.matched_person_name,
                )
                matched_ids.add(blob.id)
                return

        blob_id = f"face_{self.ID_FACE}"
        self.ID_FACE += 1
        new_blob = FaceBlob(id=blob_id, position=pos, image=face)
        new_blob.matched_person_name = person
        self.BLOBS.append(new_blob)

    @staticmethod
    def is_near(pos1, pos2, threshold=250):
        return (pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2 < threshold**2

    def decrease_life_and_remove(self, matched_ids=set()):
        to_remove = []
        for blob in self.BLOBS:
            if blob.id not in matched_ids:
                blob.life -= 1
                if blob.life <= 0:
                    to_remove.append(blob)
        for blob in to_remove:
            name, summary, img = blob.get_match_summary()
            if img is not None:
                img = cv2.resize(img, (500, 500))
                if name == "Unknown":
                    cv2.imshow("Unknown", img)
                elif name:
                    cv2.imshow(f"{name}", img)
            print(
                f"[REMOVE] {blob.id} → Most likely matched: {name} Sumarize: {summary}]"
            )
            self.BLOBS.remove(blob)

    def tracking_face(self, frame):
        detections = self.detect_faces(frame)
        annotated_frame = detections.plot()

        if not detections.boxes:
            self.decrease_life_and_remove()
            return annotated_frame, self.BLOBS

        positions, faces = self.extract_faces_and_positions(frame, detections)
        matched = set()

        for pos, face in zip(positions, faces):
            embedding = self.image_embedding(face)
            person = self.find_best_match(embedding)
            self.match_or_create_blob(pos, face, person, matched)

        self.decrease_life_and_remove(matched_ids=matched)
        return annotated_frame, self.BLOBS


if __name__ == "__main__":
    service = DetectionProcessingService()
    service.load_faiss_index()

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 960)
    cap.set(cv2.CAP_PROP_FPS, 5)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        annotated_frame, blobs = DetectionProcessingService.tracking_face(frame)

        cv2.imshow("Face Tracking", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
