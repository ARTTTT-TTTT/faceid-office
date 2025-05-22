"""
โครงสร้างโปรแกรมแบ่งตามหลัก Single Responsibility Principle
แต่ละไฟล์จะมีหน้าที่เฉพาะของตนเอง
"""

# main.py - จุดเริ่มต้นของโปรแกรม
"""
จุดเริ่มต้นโปรแกรม ทำหน้าที่เชื่อมต่อกับกล้อง และประมวลผลภาพแบบเรียลไทม์
"""
import os
import cv2

# ตั้งค่าตัวแปรแวดล้อมเพื่อหลีกเลี่ยงปัญหา OpenMP library
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"


def main():
    # ตั้งค่าและโหลดโมเดลต่างๆ
    config = AppConfig()
    detector = FaceDetector(config)
    recognizer = FaceRecognizer(config)
    tracker = FaceTracker(config)

    # เชื่อมต่อกับกล้อง
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # ใช้ DirectShow เพื่อหลีกเลี่ยงปัญหา MSMF
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 960)
    cap.set(cv2.CAP_PROP_FPS, 5)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # ตรวจจับใบหน้า
        detections = detector.detect(frame)

        # แยกตำแหน่งและภาพใบหน้า
        positions, faces = detector.extract_faces(frame, detections)

        # ระบุตัวตนและติดตามใบหน้า
        face_data = []
        for pos, face in zip(positions, faces):
            embedding = recognizer.extract_embedding(face)
            person_name = recognizer.identify_person(embedding)
            face_data.append((pos, face, person_name))

        # อัพเดทการติดตามใบหน้า
        tracker.update_tracking(face_data)

        # วาดผลลัพธ์บนเฟรม
        annotated_frame = detector.draw_detections(frame, detections)
        annotated_frame = tracker.draw_tracking_info(annotated_frame)

        # แสดงผลลัพธ์
        cv2.imshow("Face Tracking", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()


# config.py - คลาสสำหรับการตั้งค่า
"""
รวบรวมค่าการตั้งค่าทั้งหมดของโปรแกรม เพื่อให้สามารถปรับเปลี่ยนได้จากที่เดียว
"""
import os


class AppConfig:
    def __init__(self):
        # พาธของโฟลเดอร์
        self.base_dir = os.getcwd()

        # โมเดล YOLO
        self.yolo_model_name = "yolov11n-face.pt"
        self.yolo_model_path = os.path.join(
            self.base_dir, "model", self.yolo_model_name
        )
        self.yolo_threshold = 0.75  # 0.7 - 0.9 ยิ่งมากยิ่งมั่นใจ

        # โมเดล FaceNet
        self.face_embedder_model = "vggface2"

        # ไฟล์ FAISS
        self.known_faces_path = os.path.join(self.base_dir, "data", "faiss_Store")
        self.index_path = os.path.join(self.known_faces_path, "index.faiss")
        self.facenet_threshold = 0.65  # 0.6 - 0.8 ยิ่งน้อยยิ่งเหมือน

        # การตั้งค่า Blob
        self.blob_life_time = 5  # อายุหน้าก่อนโดนลบ
        self.blob_distance_threshold = 250  # ระยะห่างสำหรับการจับคู่ blob

        # การตั้งค่าการจดจำใบหน้า
        self.recognition_k_neighbors = 3  # จำนวน vector ใกล้เคียงที่ใช้ในการหาบุคคล


# face_detection.py - คลาสสำหรับการตรวจจับใบหน้า
"""
รับผิดชอบการตรวจจับใบหน้าในภาพโดยใช้ YOLO และการแยกตำแหน่งใบหน้า
"""
import cv2
from ultralytics import YOLO


class FaceDetector:
    def __init__(self, config):
        """
        ตั้งค่าตัวตรวจจับใบหน้า

        Args:
            config: อ็อบเจ็กต์การตั้งค่าแอปพลิเคชัน
        """
        self.model = YOLO(config.yolo_model_path)
        self.threshold = config.yolo_threshold

    def detect(self, frame):
        """
        ตรวจจับใบหน้าในเฟรม

        Args:
            frame: ภาพเฟรมที่ต้องการตรวจจับ

        Returns:
            ผลลัพธ์การตรวจจับจาก YOLO
        """
        results = self.model.predict(source=frame, conf=self.threshold, verbose=False)
        return results[0]

    def extract_faces(self, frame, detections):
        """
        แยกตำแหน่งและภาพใบหน้าจากผลการตรวจจับ

        Args:
            frame: ภาพเฟรมต้นฉบับ
            detections: ผลลัพธ์การตรวจจับจาก YOLO

        Returns:
            positions: รายการตำแหน่งกึ่งกลางของใบหน้า [(x, y), ...]
            faces: รายการภาพใบหน้าที่ตัดแยก
        """
        positions, faces = [], []
        for box in detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            faces.append(frame[y1:y2, x1:x2])
            positions.append(((x1 + x2) // 2, (y1 + y2) // 2))
        return positions, faces

    def draw_detections(self, frame, detections):
        """
        วาดกรอบและข้อมูลการตรวจจับบนเฟรม

        Args:
            frame: ภาพเฟรมต้นฉบับ
            detections: ผลลัพธ์การตรวจจับจาก YOLO

        Returns:
            annotated_frame: เฟรมที่มีการวาดกรอบและข้อมูลแล้ว
        """
        return detections.plot()


# face_recognition.py - คลาสสำหรับการรู้จำใบหน้า
"""
รับผิดชอบการสกัดคุณลักษณะ (embedding) ของใบหน้าและการระบุตัวตนโดยเปรียบเทียบกับฐานข้อมูล
"""
import os
import faiss
import numpy as np
from PIL import Image
import cv2
from torchvision import transforms
from facenet_pytorch import InceptionResnetV1
from langchain.vectorstores import FAISS
from langchain.embeddings.base import Embeddings
from collections import Counter


class DummyEmbeddings(Embeddings):
    """
    คลาส Embeddings สำหรับใช้กับ FAISS โดยไม่มีการ embed ใหม่
    """

    def embed_documents(self, texts):
        return texts

    def embed_query(self, text):
        return text


class FaceRecognizer:
    def __init__(self, config):
        """
        ตั้งค่าระบบรู้จำใบหน้า

        Args:
            config: อ็อบเจ็กต์การตั้งค่าแอปพลิเคชัน
        """
        self.config = config
        self.model = InceptionResnetV1(pretrained=config.face_embedder_model).eval()
        self.threshold = config.facenet_threshold
        self.k_neighbors = config.recognition_k_neighbors

        # ตั้งค่า transform สำหรับการแปลงภาพ
        self.transform = transforms.Compose(
            [
                transforms.Resize((160, 160)),
                transforms.ToTensor(),
                transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
            ]
        )

        # โหลดฐานข้อมูลใบหน้า
        self.load_face_database()

    def load_face_database(self):
        """
        โหลดฐานข้อมูลใบหน้าจาก FAISS
        """
        # โหลด FAISS จาก langchain
        self.faiss_db = FAISS.load_local(
            self.config.known_faces_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )
        self.index = faiss.read_index(self.config.index_path)

        # สร้าง index ใหม่สำหรับการค้นหาแบบ ID ที่ชัดเจน
        dimension = self.index.d
        new_index = faiss.IndexFlatL2(dimension)

        # เพิ่มเวกเตอร์กลับเข้าไปใน index ใหม่
        self.index_ivf = faiss.IndexIDMap(new_index)
        vectors = self.index.reconstruct_n(0, self.index.ntotal)
        ids = np.array(range(self.index.ntotal), dtype=np.int64)
        self.index_ivf.add_with_ids(vectors, ids)

        # สร้าง dictionary mapping ID → Name
        self.id_to_name = {}
        docstore = self.faiss_db.docstore._dict
        for idx, value in docstore.items():
            try:
                name = value.metadata.get("name", "Unknown")
                self.id_to_name[int(idx)] = name
            except:
                continue

    def extract_embedding(self, face_image):
        """
        สกัดคุณลักษณะ (embedding) จากภาพใบหน้า

        Args:
            face_image: ภาพใบหน้าที่ตัดแยกมาแล้ว

        Returns:
            embedding: เวกเตอร์คุณลักษณะของใบหน้า
        """
        pil_img = Image.fromarray(cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB))
        tensor = self.transform(pil_img).unsqueeze(0)
        return self.model(tensor).detach().cpu().numpy()[0]

    def identify_person(self, embedding):
        """
        ระบุตัวตนของบุคคลจากเวกเตอร์คุณลักษณะ

        Args:
            embedding: เวกเตอร์คุณลักษณะของใบหน้า

        Returns:
            person_name: ชื่อบุคคลที่ระบุได้ หรือ "Unknown"
        """
        # ตรวจสอบว่าได้โหลด index เรียบร้อยแล้ว
        if self.index is None:
            print("ยังไม่โหลด vector .faiss")
            raise ValueError("FAISS index not loaded.")

        # Normalize เวกเตอร์
        embedding = embedding / np.linalg.norm(embedding)

        # ค้นหาใบหน้าที่คล้ายที่สุด
        distances, indices = self.index_ivf.search(
            np.array([embedding]), k=self.k_neighbors
        )

        # แปลง index เป็นชื่อ
        matched_names = [self.id_to_name.get(int(i), "Unknown") for i in indices[0]]
        name_counter = Counter(matched_names)

        if not name_counter:
            return "Unknown"

        # หาชื่อที่พบมากที่สุด
        most_common_name = name_counter.most_common(1)[0][0]

        # ตรวจสอบความมั่นใจจากระยะห่างของเวกเตอร์
        if distances[0][0] < self.threshold:
            return most_common_name
        else:
            return "Unknown"


# face_blob.py - คลาสสำหรับเก็บข้อมูลและติดตามใบหน้า
"""
เก็บข้อมูลและสถานะของใบหน้าแต่ละคนที่ตรวจพบ รวมถึงการติดตามการเคลื่อนไหวด้วย Kalman Filter
"""
import cv2
import numpy as np
from collections import Counter


class FaceBlob:
    def __init__(self, id, position, image=None, life_time=5):
        """
        ตั้งค่าอ็อบเจ็กต์ FaceBlob

        Args:
            id: รหัสเฉพาะของ blob
            position: พิกัดตำแหน่ง (x, y)
            image: ภาพใบหน้า (ถ้ามี)
            life_time: เวลาที่อยู่ได้ก่อนถูกลบ (frames)
        """
        self.id = id
        self.position = position
        self.image = image
        self.life = life_time
        self.matched_person_name = None
        self.match_history = {}

        # ตั้งค่า Kalman Filter สำหรับการติดตาม
        self.setup_kalman_filter()

    def setup_kalman_filter(self):
        """
        ตั้งค่า Kalman Filter สำหรับการติดตามตำแหน่ง x, y
        """
        self.kalman = cv2.KalmanFilter(4, 2)  # state: [x, y, dx, dy]
        self.kalman.measurementMatrix = np.array(
            [[1, 0, 0, 0], [0, 1, 0, 0]], np.float32
        )
        self.kalman.transitionMatrix = np.array(
            [[1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 1, 0], [0, 0, 0, 1]], np.float32
        )
        self.kalman.processNoiseCov = np.eye(4, dtype=np.float32) * 0.03

        # ตั้งค่าสถานะเริ่มต้น
        initial_state = np.array(
            [[self.position[0]], [self.position[1]], [0], [0]], dtype=np.float32
        )
        self.kalman.statePre = initial_state.copy()
        self.kalman.statePost = initial_state.copy()

    def predict_position(self):
        """
        ทำนายตำแหน่งในเฟรมถัดไปโดยใช้ Kalman Filter

        Returns:
            (x, y): ตำแหน่งที่ทำนาย
        """
        prediction = self.kalman.predict()
        return int(prediction[0, 0]), int(prediction[1, 0])

    def update(self, position, image, matched_person_name):
        """
        อัพเดทสถานะของ Blob

        Args:
            position: ตำแหน่งใหม่ (x, y)
            image: ภาพใบหน้าใหม่
            matched_person_name: ชื่อบุคคลที่ตรวจพบ
        """
        self.position = position
        self.image = image
        self.life = 5  # รีเซ็ตอายุการใช้งาน

        # อัพเดท Kalman Filter
        self.kalman.correct(np.array([[position[0]], [position[1]]], dtype=np.float32))

        # บันทึกประวัติการตรวจพบ
        self.matched_person_name = matched_person_name
        self.match_history[matched_person_name] = (
            self.match_history.get(matched_person_name, 0) + 1
        )

    def get_match_summary(self):
        """
        สรุปผลการตรวจพบใบหน้า

        Returns:
            name: ชื่อบุคคลที่ตรวจพบมากที่สุด หรือ "Unknown"
            summary: ข้อความสรุปประวัติการตรวจพบ
            image: ภาพใบหน้าล่าสุด
        """
        SURE_KNOW = 5
        SURE_UNKNOWN = 5

        # สร้างข้อความสรุป
        summary = ", ".join(f"{k}: {v}" for k, v in self.match_history.items())

        # แยกเฉพาะชื่อที่ไม่ใช่ "Unknown" และเช็คว่าตรง ≥ SURE_KNOW
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

        # ตัดสินใจว่าใบหน้านี้เป็นของใคร
        if unknown_count >= max(SURE_UNKNOWN, best_match_count * 2):
            return "Unknown", summary, self.image

        if (
            best_match_name
            and unknown_count <= best_match_count * 2
            and unknown_count >= SURE_UNKNOWN
        ):
            return best_match_name, summary, self.image

        # ยังไม่เจอแน่ชัด
        return None, None, None


# face_tracking.py - คลาสสำหรับการติดตามใบหน้า
"""
รับผิดชอบการติดตามใบหน้าระหว่างเฟรม และการจัดการกลุ่มใบหน้า (Blob)
"""
import cv2


class FaceTracker:
    def __init__(self, config):
        """
        ตั้งค่าตัวติดตามใบหน้า

        Args:
            config: อ็อบเจ็กต์การตั้งค่าแอปพลิเคชัน
        """
        self.config = config
        self.blobs = []  # รายการ blobs ปัจจุบัน
        self.face_count = 0  # จำนวนใบหน้าทั้งหมดที่เคยพบ
        self.distance_threshold = config.blob_distance_threshold

    def is_near(self, pos1, pos2):
        """
        ตรวจสอบว่าตำแหน่งสองจุดอยู่ใกล้กันหรือไม่

        Args:
            pos1: ตำแหน่งที่ 1 (x, y)
            pos2: ตำแหน่งที่ 2 (x, y)

        Returns:
            bool: True ถ้าสองจุดอยู่ใกล้กัน
        """
        return (pos1[0] - pos2[0]) ** 2 + (
            pos1[1] - pos2[1]
        ) ** 2 < self.distance_threshold**2

    def update_tracking(self, face_data):
        """
        อัพเดทการติดตามใบหน้า

        Args:
            face_data: รายการข้อมูลใบหน้า [(position, image, person_name), ...]
        """
        matched_ids = set()

        # อัพเดทหรือสร้าง blobs ใหม่
        for pos, face, person_name in face_data:
            self.match_or_create_blob(pos, face, person_name, matched_ids)

        # ลด life และลบ blobs ที่หมดอายุ
        self.decrease_life_and_remove_blobs(matched_ids)

    def match_or_create_blob(self, pos, face, person_name, matched_ids):
        """
        จับคู่ใบหน้ากับ blob ที่มีอยู่หรือสร้าง blob ใหม่

        Args:
            pos: ตำแหน่งใบหน้า (x, y)
            face: ภาพใบหน้า
            person_name: ชื่อบุคคล
            matched_ids: เซ็ตที่เก็บ ID ของ blobs ที่ถูกจับคู่แล้ว
        """
        # ตรวจสอบว่าใกล้กับ blob ที่มีอยู่หรือไม่
        for blob in self.blobs:
            if self.is_near(blob.predict_position(), pos):
                blob.update(
                    position=pos,
                    image=face,
                    matched_person_name=person_name or blob.matched_person_name,
                )
                matched_ids.add(blob.id)
                return

        # สร้าง blob ใหม่
        blob_id = f"face_{self.face_count}"
        self.face_count += 1
        new_blob = FaceBlob(
            id=blob_id, position=pos, image=face, life_time=self.config.blob_life_time
        )
        new_blob.matched_person_name = person_name
        self.blobs.append(new_blob)

    def decrease_life_and_remove_blobs(self, matched_ids):
        """
        ลดอายุของ blobs ที่ไม่ได้ถูกจับคู่ และลบ blobs ที่หมดอายุ

        Args:
            matched_ids: เซ็ตที่เก็บ ID ของ blobs ที่ถูกจับคู่แล้ว
        """
        to_remove = []

        # ลดอายุของ blobs ที่ไม่ได้ถูกจับคู่
        for blob in self.blobs:
            if blob.id not in matched_ids:
                blob.life -= 1
                if blob.life <= 0:
                    to_remove.append(blob)

        # ลบ blobs ที่หมดอายุ
        for blob in to_remove:
            name, summary, img = blob.get_match_summary()
            if img is not None:
                img = cv2.resize(img, (500, 500))
                if name == "Unknown":
                    cv2.imshow("Unknown", img)
                if name:
                    cv2.imshow(f"{name}", img)

            print(
                f"[REMOVE] {blob.id} → Most likely matched: {name} Sumarize: {summary}]"
            )
            self.blobs.remove(blob)

    def draw_tracking_info(self, frame):
        """
        วาดข้อมูลการติดตามลงบนเฟรม

        Args:
            frame: ภาพเฟรมที่ต้องการวาด

        Returns:
            frame: เฟรมที่วาดข้อมูลแล้ว
        """
        for blob in self.blobs:
            x, y = blob.position
            text = f"{blob.id}: {blob.matched_person_name or 'Unknown'}"
            cv2.putText(
                frame,
                text,
                (x - 40, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2,
            )
            cv2.circle(frame, (x, y), 5, (255, 0, 0), -1)

        return frame
