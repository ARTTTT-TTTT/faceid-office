import os
import uuid
import faiss
import torch
import numpy as np
import pillow_heif
from PIL import Image
from tqdm import tqdm
from ultralytics import YOLO
from facenet_pytorch import InceptionResnetV1


from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from langchain_community.docstore.in_memory import InMemoryDocstore


from app.utils.transform_factory import face_transform
from app.core.dummy_embedding import DummyEmbeddings
from app.constants.core_config import CoreConfig


pillow_heif.register_heif_opener()

# !FEATURE แยก vector ของแต่ละ admin
"""
vector
├── [admin_id]/
│ ├── index.faiss
| └──index.pkl
├── [admin_id]/
| ├── index.faiss
| └── index.pkl
└── ...
"""

# !FEATURE HANDLE ERROR AND RETURN

"""
storage
├── face-images/
│ ├── [person_id]/
│ │ ├── uuid1.jpg
│ │ ├── uuid2.jpg
│ │ └── uuid3.jpg
│ ├── [person_id]/
│ │ ├── uuid1.jpg
│ │ ├── uuid2.jpg
│ │ └── uuid3.jpg
│ └── ...
"""


class Vector:
    def __init__(self, device=None):
        self.config = CoreConfig()
        self.device = device or self.config.default_device
        self.embedding_dim = self.config.embedding_dim
        self.model = (
            InceptionResnetV1(pretrained=self.config.face_embedder_model)
            .eval()
            .to(self.device)
        )
        self.model_YOLO = YOLO(self.config.yolo_model_path)
        self.vector_path = self.config.vector_path
        self.face_images_path = self.config.face_images_path
        self.batch_size = self.config.batch_size

        self.transform = face_transform()

    def extract_face_vectors(self, face_images_folder: str):
        """
        Extract vectors from all person_id folders in the face_images_folder.
        """
        all_vectors = []
        all_docs = []

        for person_id_folder in tqdm(
            os.listdir(face_images_folder), desc=f"Processing {face_images_folder}"
        ):
            person_folder = os.path.join(face_images_folder, person_id_folder)
            if not os.path.isdir(person_folder):
                continue

            vectors, docs = self.extract_face_vectors_single(person_folder)
            all_vectors.extend(vectors)
            all_docs.extend(docs)

        return all_vectors, all_docs

    def extract_face_vectors_single(self, person_folder: str):
        """
        Extract vectors from all images inside a single person_folder.
        """
        vectors = []
        docs = []
        person_id = os.path.basename(person_folder)

        for img_file in os.listdir(person_folder):
            img_path = os.path.join(person_folder, img_file)

            try:
                img = Image.open(img_path).convert("RGB")
            except Exception as e:
                print(f"[!] Error loading image: {img_path} | {e}")
                continue

            # YOLO face detection
            results = self.model_YOLO.predict(source=img, conf=0.8, verbose=False)
            detections = results[0]

            if not detections.boxes or len(detections.boxes) == 0:
                print(f"[!] No face found in: {img_path}")
                continue

            # Crop face
            x1, y1, x2, y2 = map(int, detections.boxes[0].xyxy[0])
            cropped = img.crop((x1, y1, x2, y2))

            # Convert to tensor
            face_tensor = self.transform(cropped).unsqueeze(0).to(self.device)

            # Extract embedding
            with torch.no_grad():
                embedding = self.model(face_tensor).squeeze().cpu().numpy()
                embedding = embedding / np.linalg.norm(embedding)

                vectors.append(embedding)
                docs.append(
                    Document(
                        page_content="face_vector",
                        metadata={"name": person_id, "image": img_file},
                    )
                )

        return vectors, docs

    """
    ========== CRUD ===========
    """

    def get_people_vectors(self):
        """
        แสดงชื่อบุคคลทั้งหมดในฐานข้อมูล พร้อมจำนวนภาพและ metadata ของแต่ละภาพ
        """
        db = FAISS.load_local(
            self.vector_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )

        people_data = {}

        for idx, doc_id in db.index_to_docstore_id.items():
            doc = db.docstore.search(doc_id)
            name = doc.metadata.get("name")

            if name not in people_data:
                people_data[name] = []

            result_info = {"index": idx, "doc_id": doc_id, "metadata": doc.metadata}
            people_data[name].append(result_info)

        # สรุปผล
        for person_name, vectors in people_data.items():
            print(f"\n👤 {person_name} - {len(vectors)} vectors")
            for vector in vectors:
                print(
                    f"   ↳ Index={vector['index']}, Doc ID='{vector['doc_id']}', Metadata={vector['metadata']}"
                )

        return people_data

    def get_person_vectors(self, person_id: str):
        """
        database มี person_name(ชื่อนั้นกี่ภาพและอะไรบ้าง)
        """
        db = FAISS.load_local(
            self.vector_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )
        results = []
        for idx, doc_id in db.index_to_docstore_id.items():
            doc = db.docstore.search(doc_id)
            if doc.metadata.get("name") == person_id:
                result_info = {"index": idx, "doc_id": doc_id, "metadata": doc.metadata}
                results.append(result_info)
                print(
                    f"[🔍] Found vector: Index={idx}, Doc ID='{doc_id}', Metadata={doc.metadata}"
                )
        print(f"[ℹ️] Total vectors found for '{person_id}': {len(results)}")
        return results

    def get_total_vectors(self):
        """
        นับจำนวนเวกเตอร์ใบหน้าทั้งหมดใน FAISS database
        """
        db = FAISS.load_local(
            self.vector_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )
        total_count = db.index.ntotal
        print(f"[📊] Total face vectors in FAISS: {total_count}")
        return total_count

    def build_empty_vectors(self):
        """
        index    : สร้าง vector ขนาด 512
        docstore : สร้าง ที่ว่าง ๆ ที่เก็บ metadata เช่น ชื่อบุคคลและชื่อไฟล์
        index_to_docstore_id : dictionary mapping จาก index ใน FAISS ไปยัง ID ใน docstore

        db
        index: FAISS index สำหรับจัดเก็บเวกเตอร์
        docstore: เก็บ metadata เช่น ชื่อคนและชื่อรูป
        index_to_docstore_id: mapping ระหว่าง index กับ ID ใน docstore
        """

        index = faiss.IndexIDMap(faiss.IndexFlatL2(self.embedding_dim))  # ใช้ IndexIDMap
        docstore = InMemoryDocstore({})
        index_to_docstore_id = {}
        db = FAISS(
            embedding_function=DummyEmbeddings(),
            index=index,
            docstore=docstore,
            index_to_docstore_id=index_to_docstore_id,
        )
        db.save_local(self.vector_path)
        print("[✅] Empty FAISS database created and saved.")

    def build_vectors(self):
        """
        batch_size : แบ่งเป็น batch เพื่อลดการใช้ RAM
        index : สร้าง IndexFlatL2 -ขนาด 512
        index.add : เอา vector ที่ extract มาไปใส่ ใน index
        docstore : loop เอา vector ที่อยู่ใน index มาเก็บใน docstore

        doc_ids : เก็บ uuid ตามจำนวน vector ที่ได้จาก image_person
        docstore_dict : เป็น unique id ของแต่ละภาพ
        index_to_docstore_id : สสร้าง dictionary ที่ mapping ระหว่าง ลำดับ index ใน FAISS กับ ID ของเอกสารใน docstore
        """

        vectors, docs = self.extract_face_vectors(self.face_images_path)
        if not vectors:
            print("[❗] No face vectors extracted.")
            return

        index = faiss.IndexIDMap(faiss.IndexFlatL2(self.embedding_dim))
        ids = np.array(range(len(vectors)), dtype=np.int64)
        for i in range(0, len(vectors), self.batch_size):
            batch_vecs = np.array(vectors[i : i + self.batch_size]).astype(np.float32)
            batch_ids = ids[i : i + self.batch_size]
            index.add_with_ids(batch_vecs, batch_ids)

        docstore_dict = {}
        index_to_docstore_id = {}
        for i, doc in enumerate(docs):
            doc_id = str(uuid.uuid4())
            docstore_dict[doc_id] = doc
            index_to_docstore_id[i] = doc_id

        db = FAISS(
            embedding_function=DummyEmbeddings(),
            index=index,
            docstore=InMemoryDocstore(docstore_dict),
            index_to_docstore_id=index_to_docstore_id,
        )
        db.save_local(self.vector_path)
        print("[✅] FAISS database built with IndexIDMap and saved.")
        return True

    def update_person_vectors(self, person_id: str):
        """
        db
        load model vector : เดิมมาใช้งานเป็น base

        existing_keys : เช็คว่า Metadata={'name': 'Pun', 'image': 'IMG_6371.HEIC'}
        ซ้ำกับชื่อและภาพที่อยู่ใน model มั้ย

        """
        person_folder = os.path.join(self.config.face_images_path + "/" + person_id)

        db = FAISS.load_local(
            self.vector_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )
        existing_keys = {
            f"{doc.metadata['name']}_{doc.metadata['image']}"
            for doc in db.docstore._dict.values()
        }

        new_vectors, new_docs = self.extract_face_vectors_single(person_folder)
        if not new_vectors:
            
            print("[❗] No new faces to add.")
            return

        filtered_vectors = []
        filtered_docs = []
        for vec, doc in zip(new_vectors, new_docs):
            key = f"{doc.metadata['name']}_{doc.metadata['image']}"
            if key not in existing_keys:
                filtered_vectors.append(vec)
                filtered_docs.append(doc)
                existing_keys.add(key)

        if not filtered_vectors:
            print("[ℹ️] All vectors already exist in FAISS.")
            return

        current_count = db.index.ntotal
        ids = np.array(
            range(current_count, current_count + len(filtered_vectors)), dtype=np.int64
        )
        db.index.add_with_ids(np.array(filtered_vectors).astype(np.float32), ids)

        # อัปเดต docstore และ index_to_docstore_id
        for i, (vec, doc) in enumerate(zip(filtered_vectors, filtered_docs)):
            doc_id = str(uuid.uuid4())
            db.docstore._dict[doc_id] = doc
            db.index_to_docstore_id[current_count + i] = doc_id

        db.save_local(self.vector_path)

    def delete_person_vectors(self, person_id: str):
        """
        เช็คจากชื่อ ว่าใน metadata มีชื่อนั้นมั้ย ถ้ามี ลบ
        """
        # !FEATURE ยิง API ลบ person_folder

        db = FAISS.load_local(
            self.vector_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )

        indices_to_delete = []
        for idx, doc_id in db.index_to_docstore_id.items():
            doc = db.docstore.search(doc_id)
            if doc.metadata.get("name") == person_id:
                faiss_id = idx
                indices_to_delete.append(faiss_id)

        if not indices_to_delete:
            print(f"[❗] No vectors found with name '{person_id}'.")
            return

        print(f"[🗑️] Deleting {len(indices_to_delete)} vectors for '{person_id}'...")
        db.index.remove_ids(np.array(indices_to_delete, dtype=np.int64))

        remaining_index_map = {}
        remaining_docstore = {}
        for idx, doc_id in db.index_to_docstore_id.items():
            if idx not in indices_to_delete:
                remaining_index_map[idx] = doc_id
                remaining_docstore[doc_id] = db.docstore.search(doc_id)

        db.docstore = InMemoryDocstore(remaining_docstore)
        db.index_to_docstore_id = remaining_index_map

        db.save_local(self.vector_path)
