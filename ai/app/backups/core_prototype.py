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
        self.config = CoreConfig()
        self.id = id
        self.image = image
        self.position = position
        self.life = self.config.blob_life_time

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

        self.kalman.correct(np.array([[position[0]], [position[1]]], dtype=np.float32))

        self.matched_person_name = matched_person_name
        self.match_history[matched_person_name] = (
            self.match_history.get(matched_person_name, 0) + 1
        )

    def get_match_summary(self):
        summary = ", ".join(f"{k}: {v}" for k, v in self.match_history.items())
        valid_named = {
            name: count
            for name, count in self.match_history.items()
            if name != "Unknown" and count >= self.config.sure_know
        }

        best_match_name, best_match_count = (None, 0)
        if valid_named:
            best_match_name, best_match_count = max(
                valid_named.items(), key=lambda x: x[1]
            )

        unknown_count = self.match_history.get("Unknown", 0)

        if unknown_count >= max(self.config.sure_unknown, best_match_count * 2):
            return "Unknown", summary, self.image

        if (
            best_match_name
            and unknown_count <= best_match_count * 2
            and unknown_count >= self.config.sure_unknown
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
        self.config = CoreConfig()
        self.model_YOLO = YOLO(self.config.yolo_model_path)
        self.model_Facenet = (
            InceptionResnetV1(pretrained=self.config.face_embedder_model)
            .to(self.config.default_device)
            .eval()
        )
        self.transform = face_transform()

        self.id_face = 0
        self.blobs = []

        # FAISS Index placeholder
        self.index = None
        self.index_ivf = None
        self.id_to_name = {}

    def load_faiss_index(self):
        self.faiss_db = FAISS.load_local(
            self.config.vector_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )

        self.index = faiss.read_index(self.config.faiss_path)

        if not isinstance(self.index, faiss.IndexIDMap):
            raise ValueError("Loaded index must be IndexIDMap")

        self.index_ivf = self.index

        docstore_dict = self.faiss_db.docstore._dict
        index_to_docstore_id = self.faiss_db.index_to_docstore_id

        self.id_to_name = {
            faiss_idx: docstore_dict[doc_id].metadata.get("name", "Unknown")
            for faiss_idx, doc_id in index_to_docstore_id.items()
            if doc_id in docstore_dict
        }

        print("[✅] FAISS index and mappings loaded successfully.")

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
        tensor = self.transform(pil_img).unsqueeze(0).to(self.config.default_device)
        embedding = self.model_Facenet(tensor).detach().cpu().numpy()[0]
        return embedding

    def find_best_match(self, embedding):
        if self.index is None:
            raise ValueError("FAISS index not loaded.")
        embedding = embedding / np.linalg.norm(embedding)
        distances, indices = self.index_ivf.search(
            np.array([embedding]), k=self.config.recognition_k_neighbors
        )
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
        for blob in self.blobs:
            if self.is_near(blob.predict_position(), pos):
                blob.update(
                    position=pos,
                    image=face,
                    matched_person_name=person or blob.matched_person_name,
                )
                matched_ids.add(blob.id)
                return

        blob_id = f"face_{self.id_face}"
        self.id_face += 1
        new_blob = FaceBlob(id=blob_id, position=pos, image=face)
        new_blob.matched_person_name = person
        self.blobs.append(new_blob)

    def is_near(self, pos1, pos2):
        return (pos1[0] - pos2[0]) ** 2 + (
            pos1[1] - pos2[1]
        ) ** 2 < self.config.blob_distance_threshold**2

    def decrease_life_and_remove(self, matched_ids=set()):
        to_remove = []
        for blob in self.blobs:
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
            self.blobs.remove(blob)

    def tracking_face(self, frame):
        detections = self.detect_faces(frame)
        annotated_frame = detections.plot()

        if not detections.boxes:
            self.decrease_life_and_remove()
            return annotated_frame, self.blobs

        positions, faces = self.extract_faces_and_positions(frame, detections)
        matched = set()

        for pos, face in zip(positions, faces):
            embedding = self.image_embedding(face)
            person = self.find_best_match(embedding)
            self.match_or_create_blob(pos, face, person, matched)

        self.decrease_life_and_remove(matched_ids=matched)
        return annotated_frame, self.blobs


if __name__ == "__main__":
    service = DetectionProcessingService()
    service.load_faiss_index()

    # === WINDOWS ===
    # cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    # cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    # cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 960)
    # cap.set(cv2.CAP_PROP_FPS, 5)

    # === MACOS ===
    cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        annotated_frame, blobs = service.tracking_face(frame)

        cv2.imshow("Face Tracking", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
