# face_recognition.py - คลาสสำหรับการรู้จำใบหน้า
"""
รับผิดชอบการสกัดคุณลักษณะ (embedding) ของใบหน้าและการระบุตัวตนโดยเปรียบเทียบกับฐานข้อมูล
"""
import cv2
import faiss
import numpy as np

from PIL import Image
from collections import Counter
from facenet_pytorch import InceptionResnetV1
from langchain_community.vectorstores import FAISS


from app.utils.transform_factory import face_transform
from app.core.face_embedding import DummyEmbeddings


class FaceRecognizer:
    def __init__(self, config):
        """
        ตั้งค่าระบบรู้จำใบหน้า

        Args:
            config: อ็อบเจ็กต์การตั้งค่าแอปพลิเคชัน
        """
        self.config = config
        self.model_Facenet = InceptionResnetV1(
            pretrained=config.face_embedder_model
        ).eval()
        self.threshold = config.facenet_threshold
        self.k_neighbors = config.recognition_k_neighbors

        # ตั้งค่า transform สำหรับการแปลงภาพ
        self.transform = face_transform()

        # โหลดฐานข้อมูลใบหน้า
        self.load_face_database()

    def load_face_database(self):
        """
        โหลดฐานข้อมูลใบหน้าจาก FAISS
        """
        self.faiss_db = FAISS.load_local(
            self.config.vector_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )
        self.index = faiss.read_index(self.config.faiss_path)

        # ไม่ต้อง reconstruct vectors ถ้า index ไม่รองรับ
        # ให้ใช้ index ต้นฉบับเลย
        self.index_ivf = self.index  # ใช้ index เดิมเลย

        # สร้าง dictionary mapping ID → Name
        self.id_to_name = {}
        docstore = self.faiss_db.docstore._dict
        for idx, value in docstore.items():
            try:
                name = value.metadata.get("name", "Unknown")
                self.id_to_name[int(idx)] = name
            except Exception:
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
        return self.model_Facenet(tensor).detach().cpu().numpy()[0]

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
