import os
import cv2
import faiss
import numpy as np

from PIL import Image
from ultralytics import YOLO
from collections import Counter
from torchvision import transforms
from langchain.vectorstores import FAISS
from facenet_pytorch import InceptionResnetV1
from langchain.embeddings.base import Embeddings

"""
ตั้งค่าตัวแปรแวดล้อม (environment variable) เพื่อหลีกเลี่ยงปัญหาเกี่ยวกับ OpenMP library ที่อาจเกิดขึ้นเมื่อใช้งานไลบรารีที่เกี่ยวข้องกับการประมวลผลแบบขนาน 
เช่น NumPy, PyTorch, TensorFlow, หรือ scikit-learn บนบางระบบ (เช่น macOS หรือ Windows)


💥 ปัญหาที่มักเกิด:
คุณอาจเจอ error เช่นนี้:

OMP: Error #15: Initializing libiomp5md.dll, but found libiomp5md.dll already initialized.
หรือ

OMP: Hint This means that multiple copies of the OpenMP runtime have been linked into the program.
ซึ่งบอกว่า OpenMP (ตัวจัดการ multi-threading) ถูกโหลดซ้ำจากหลายที่ เช่นจาก PyTorch และ NumPy พร้อมกัน

การใช้ KMP_DUPLICATE_LIB_OK = "TRUE"
การตั้ง os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE" จะ:

บอกให้ระบบ ยอมให้มีการโหลดไลบรารี OpenMP ซ้ำได้

หลีกเลี่ยง crash หรือ error โดยไม่ต้องแก้ library
"""

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"


class FaceBlob:
    def __init__(self, id, position, image=None):
        """
        blob_id , id : (ตั้งแต่เปิดมาเป็นหน้าที่เท่าไหรที่เจอ),
        position     : (center = x,y),
        image        : (ภาพล่าสุดที่ถูก update มา),
        life         : (ถ้าหายเกิน 5 frame จะ ลบ blob นี้ทิ้ง),

        matched_person_name = None
        (ถ้า blob นี้ matched กับ หน้าใครชื่อจะแปลง ถ้าไม่ matched = unknown)

        match_history : เก็บว่า blob นี้ เคยเจอหน้าเป็นใครบ้าง {"name",จำนวนครั้งที่เจอ}

        kalman : setup kalmanfilter ต่างๆในการ predict
        kalman.processNoiseCov *0.03 เพื่อไม่ให้เชื่อการ predict มากเกินไปต้อง add noise
        """
        self.id = id
        self.position = position
        self.image = image
        self.life = DetectionProcessingService.LIFE_TIME
        self.matched_person_name = None
        self.match_history = {}
        # Kalman Filter setup for tracking x, y
        self.kalman = cv2.KalmanFilter(4, 2)  # state: [x, y, dx, dy]
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
        """
        update        :Blob status ในก็ณีที่ matched กับตัวเก่า
        match_history : และเพิ่มว่า Blob ตัวนี้ชื่ออะไร ในกรณีที่เคยเจอแล้วให้บอกเพิ่มว่าเคยเจอ blob ตัวนี้ กี่ครั้งแล้ว
        """
        self.position = position
        self.image = image
        self.life = DetectionProcessingService.LIFE_TIME

        self.kalman.correct(np.array([[position[0]], [position[1]]], dtype=np.float32))

        self.matched_person_name = matched_person_name
        self.match_history[matched_person_name] = (
            self.match_history.get(matched_person_name, 0) + 1
        )

    def get_match_summary(self):
        """
        SURE_KNOW = 5     : มันใจว่า เป็นคนนั้นด้วย 5 frame
        SURE_UNKNOWN = 5   : มันใจว่า ไม่รู้ว่าเป็นคนใครด้วย 5 frame

        named_matches     : ชื่อทุกคนที่เจอจากการเทียบ vector
        valid_named       : ชื่อทุกคนที่มันใจว่า SURE_KNOW

        best_match_name   : คนที่่หมือนที่สุด
        best_match_count  : เช็คว่าคนที่เหมือนมีกี่คน
        unknown_count      : เรียกจำนวน get ที่เจอ

        Output :
          ถ้า unknown มากกว่า = กว่าชื่อคนที่มากที่สุด 2 เท่า จะเป็น unknown
          ถ้า ชื่อ คนที่เหมือนที่สุด มากที่สุด จะแสดงชื่อ คนนั้น
        """

        SURE_KNOW = 5
        SURE_UNKNOWN = 5
        summary = ", ".join(f"{k}: {v}" for k, v in self.match_history.items())
        # แยกเฉพาะชื่อที่ไม่ใช่ "Unknow" และเช็คว่าตรง ≥ SURE_KNOW
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

        # ยังไม่เจอแน่ชัด
        return None, None, None


class DummyEmbeddings(Embeddings):
    def embed_documents(self, texts):
        return texts

    def embed_query(self, text):
        return text


class DetectionProcessingService:
    # === Configure ===
    base_dir = os.getcwd()
    YOLO_MODEL = "yolov11n-face.pt"  # ชื่อ model YOLO
    FACE_EMBEDDER_MODEL = (
        "vggface2"  # ชื่อ model facenet ต้องตรง กับ model ที่ใช้บีบ อักใน .faiss ด้วย
    )

    yolo_model_path = os.path.join(base_dir, "model", YOLO_MODEL)
    known_faces_path = os.path.join(base_dir, "data", "faiss_Store")
    index_path = os.path.join(known_faces_path, "index.faiss")
    model_YOLO = YOLO(yolo_model_path)
    model_Facenet = InceptionResnetV1(pretrained=FACE_EMBEDDER_MODEL).eval()

    # === Confident ===
    YOLO_THRESHOLD = 0.75  # 0.7 - 0.9 คือ ยิ่งมากยื่งเหมือน
    FACENET_THRESHOLD = 0.65  # 0.6 - 0.8 คือ ยังเหมือนยื่งน้อยยิ่งเหมือน

    # === Blob Configure ===
    LIFE_TIME = 5  # อายุหน้าก่อนโดนลบ maximum 5 frame ถ้ามากเกินหน้าจะถูกแทนที่
    ID_FACE = 0  # หน้าทั้งหมดที่เคยเจอใน รอบการรันนี้ start ที่ 0
    BLOBS = []  # หน้าทั้งหมดใน frame ปัจจุบัน

    transform = transforms.Compose(
        [
            transforms.Resize((160, 160)),
            transforms.ToTensor(),
            transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
        ]
    )

    # === Faiss Configure ===
    index = None
    index_ivf = None  # เช็ค dimension ของ แต่ละ vector
    id_to_name = {}  # ชื่อที่ match ตอนหา near less neigbors

    @classmethod
    def load_faiss_index(cls):
        """
        cls.faiss_db :
          ใช้ FAISS.load_local()           : เพื่อโหลดฐานข้อมูลเวกเตอร์จากโฟลเดอร์ cls.FAISS_DIR
          DummyEmbeddings                 : เป็น placeholder เพราะไม่ได้ต้องการ embed ใหม่
          allow_dangerous_deserialization : อนุญาตให้โหลด object ที่อาจไม่ปลอดภัย (จำเป็นในบางกรณี)

        IndexIDMap : เพื่อให้สามารถค้นหา vector พร้อมระบุ ID ของแต่ละ vector ได้

        """
        # โหลด FAISS จาก langchain
        cls.faiss_db = FAISS.load_local(
            cls.known_faces_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )
        cls.index = faiss.read_index(cls.index_path)

        dimension = (
            cls.index.d
        )  # สร้าง Dimension ของ embedding vector สำหรับคำนวณระยะห่างแบบ Euclidean
        new_index = faiss.IndexFlatL2(
            dimension
        )  # หรือใช้ IndexFlatIP หากใช้ inner product

        # เพิ่มเวกเตอร์กลับเข้าไปใน index ใหม่
        cls.index_ivf = faiss.IndexIDMap(new_index)
        vectors = cls.index.reconstruct_n(0, cls.index.ntotal)
        ids = np.array(range(cls.index.ntotal), dtype=np.int64)
        cls.index_ivf.add_with_ids(vectors, ids)

        # สร้าง dictionary mapping ID → Name
        cls.id_to_name = {}
        docstore = cls.faiss_db.docstore._dict
        for idx, value in docstore.items():
            try:
                name = value.metadata.get("name", "Unknown")
                cls.id_to_name[int(idx)] = name
            except:
                continue

    @classmethod
    def detect_faces(cls, frame):
        """
        YOLO หา x,y ของหน้าคน
        """
        results = cls.model_YOLO.predict(
            source=frame, conf=cls.YOLO_THRESHOLD, verbose=False
        )
        return results[0]

    @classmethod
    def extract_faces_and_positions(cls, frame, detections):
        """
        position : x,y ขวาบน ซ้ายล่าง ของคนที่เจอใน fram
        faces    : หน้าคนที่ cropped ได้
        """

        positions, faces = [], []
        for box in detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            faces.append(frame[y1:y2, x1:x2])
            positions.append(((x1 + x2) // 2, (y1 + y2) // 2))
        return positions, faces

    @classmethod
    def image_embedding(cls, cropped_image):
        """
        pil_img   : เอาภาพที่รับมาแปลงเป็น rgb
        tensor    : รับภาพ rgb เอาเข้าไป compose และ แปลงขนาดภาพ และแปลง ค่า RGB ไป 0-1 และ ทำ Normalize และ .unsqueeze เพื่อเปลี่ยนจาก “ภาพเดียว” → “batch ขนาด 1”

        cls.model_Facenet(tensor).detach().cpu().numpy()[0] => เข้า facenet เพื่อบีบเป็น vector
        .detach() : ใช้ตอน inference ไม่ต้องเก็บ gradient
        .cpu()    : numpy() ทำงานได้แค่บน CPU
        .numpy()  : PyTorch Tensor → NumPy array
        [0]       : ดึง batch แรกออกมา (เพราะ input มี shape [1, 512] → ต้องการ [512])
        """
        pil_img = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))
        tensor = cls.transform(pil_img).unsqueeze(0)
        return cls.model_Facenet(tensor).detach().cpu().numpy()[0]

    @classmethod
    def find_best_match(cls, embedding):
        """
        embedding     : Normalize เวกเตอร์ (ทำให้ความยาวของเวกเตอร์ = 1) เพื่อให้เปรียบเทียบระยะทางได้ถูกต้อง
        distances     : ระยะห่างจากเวกเตอร์ต้นฉบับ (ยิ่งน้อยยิ่งคล้าย)
        indices       : index ของเวกเตอร์ที่ตรงในฐานข้อมูล
        K คือค่า vector ที่อยู่ใกล้ กับ vector ตัวที่เราต้องการหา ใช้เป็นจำนวนคี่ เพื่อไม่ให้เกิดการเท่ากันของ vector 1,3,5,..
        (เราใส่  คนละ 3 vector ก็ควรใช้ 3 เพื่อไม่ให้ล้น ต่อคน ถ้าปรับเก็บรูปต่อคนเพิ่มให้มาแก้ตรงนี้)

        matched_names    : เอาชื่อที่ได้ออกมาเป็น เก็บเป็น tuple ถ้าไม่เจอให้เป็น unknown
        name_counter     : ใน K(3) คน มีชื่อใครเยอะที่สุด
        most_common_name : ชื่อคนที่เจอ vector เยอะที่สุด

        Output:
        ชื่อคนที่เหมือน , คนที่ไม่ชัว "Unknown"
        """
        # Check ว่าload หน้าคนรึยัง
        if cls.index is None:
            print("ยังไม่โหลด vector .faiss")
            raise ValueError("FAISS index not loaded.")

        embedding = embedding / np.linalg.norm(embedding)
        distances, indices = cls.index_ivf.search(np.array([embedding]), k=3)
        matched_names = [cls.id_to_name.get(int(i), "Unknown") for i in indices[0]]
        name_counter = Counter(matched_names)
        if not name_counter:
            return "Unknown"

        most_common_name = name_counter.most_common(1)[0][0]
        if distances[0][0] < cls.FACENET_THRESHOLD:
            return most_common_name
        else:
            return "Unknown"

    @classmethod
    def match_or_create_blob(cls, pos, face, person, matched_ids):
        """
        ถ้าเป็น blob เก่าก็เช็คว่า ใครใกล้ หน้าใหม่อันไหน

        blob.predict_position() : ใช้ kalman filter position ใหม่
        ถ้าใกล้จะ update ค่า ให้ blob

        cls.BLOBS : เก็บ status ต่างๆของหน้าคนที่เจอใน frame
        new_blob  : ใส่ค่า status ไป add new_blob

        """

        for blob in cls.BLOBS:
            if cls.is_near(blob.predict_position(), pos):
                blob.update(
                    position=pos,
                    image=face,
                    matched_person_name=person or blob.matched_person_name,
                )
                matched_ids.add(blob.id)
                return

        blob_id = f"face_{cls.ID_FACE}"
        cls.ID_FACE += 1
        new_blob = FaceBlob(id=blob_id, position=pos, image=face)
        new_blob.matched_person_name = person
        cls.BLOBS.append(new_blob)

    @staticmethod
    def is_near(pos1, pos2, threshold=250):
        """
        pos1 : สิ่งที่ระบบคาดว่า "วัตถุ" ควรจะอยู่ตรงนั้น ตามการคำนวณของ Kalman Filter
        pos2 : สิ่งที่ตรวจจับได้จริงในเฟรมนี้
        """

        return (pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2 < threshold**2

    @classmethod
    def decrease_life_and_remove(cls, matched_ids=set()):
        """
        to_remove : list ของรายชื่อทีจะถูก ลบ เพราะ life_time < 5

        name    : ชื่อของ blob คนนี้ ที่ matched ที่สุด
        summary : blob ตัวนี้เคยถูกเจอเป็นใครบ้าง
        img     : ภาพล่าสุดที่ถูก cap

        """
        to_remove = []
        for blob in cls.BLOBS:
            if blob.id not in matched_ids:
                blob.life -= 1
                if blob.life <= 0:
                    to_remove.append(blob)
        # blob ที่ต้องถูก ลบทิ้งเพราะ life_time หมด
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
            cls.BLOBS.remove(blob)

    @classmethod
    def tracking_face(cls, frame):
        """YOLO DETECTED FACE"""
        detections = cls.detect_faces(frame)
        annotated_frame = detections.plot()

        """หาไม่เจอ return ออกไปเลย"""
        if not detections.boxes:
            # ลด life_time ทุกคนที่อยู่ใน frame ก่อนหน้า
            cls.decrease_life_and_remove()
            return annotated_frame, cls.BLOBS

        """
        หาเจอ เข้าระบบ recognization
        input:
          frame     : frame ที่เรารับมาจากกล้อง
          detection : x,y ทั้งมุมขวาบนและซ้ายล่าง

        output:
          positions : x,y ของ center หน้าคนที่เจอ
          faces     : ภาพของหน้าคนที่เจอ
        """
        positions, faces = cls.extract_faces_and_positions(frame, detections)

        matched = set()  # list หน้าคนทั้งหมดที่อยู่ใน frame
        """
        zip(positions, faces) : เอาข้อมูล list position,faces มารวมกันแล้ว loop ออกพร้อมกัน
        """
        for pos, face in zip(positions, faces):
            embedding = cls.image_embedding(face)  # บีบ faces(ภาพหน้า) ให้เป็น vector
            person = cls.find_best_match(
                embedding
            )  # เอาภาพที่บีบได้ไป check ว่า เหมือนใครที่สุด
            cls.match_or_create_blob(pos, face, person, matched)

        cls.decrease_life_and_remove(matched_ids=matched)
        return annotated_frame, cls.BLOBS


if __name__ == "__main__":
    # load vector known faces form path:D:\Project\FaceDetect\data\faiss_Eng_Name
    DetectionProcessingService.load_faiss_index()

    # define input frame
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # use DirectShow to avoid MSMF error
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 960)
    cap.set(cv2.CAP_PROP_FPS, 5)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        annotated_frame, blobs = DetectionProcessingService.tracking_face(frame)

        # label bounding box
        # Draw blob ID and matched name
        # for blob in blobs:
        #     x, y = blob.position
        #     text = f"{blob.id}: {blob.matched_person_name or 'Unknow'}"
        #     cv2.putText(
        #         annotated_frame,
        #         text,
        #         (x - 40, y - 10),
        #         cv2.FONT_HERSHEY_SIMPLEX,
        #         0.5,
        #         (0, 255, 0),
        #         2,
        #     )
        #     cv2.circle(annotated_frame, (x, y), 5, (255, 0, 0), -1)

        cv2.imshow("Face Tracking", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
