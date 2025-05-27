import os
import torch
import pathlib


class CoreConfig:
    def __init__(self):

        # DIRECTORIES
        self.base_dir = os.getcwd()
        current_file = pathlib.Path(__file__).resolve()
        self.project_dir = current_file.parents[3]

        # YOLO
        self.yolo_model_name = "yolov11n-face.pt"
        self.yolo_model_path = os.path.join(
            self.base_dir, "app/models", self.yolo_model_name
        )
        self.yolo_threshold = 0.75  # 0.7 - 0.9 ยิ่งมากยิ่งมั่นใจ

        # FACENET
        self.face_embedder_model = "vggface2"
        self.default_device = "cuda" if torch.cuda.is_available() else "cpu"
        self.embedding_dim = 512
        self.facenet_threshold = 0.65  # 0.6 - 0.8 ยิ่งน้อยยิ่งเหมือน

        # VECTOR
        self.vector_path = os.path.join(self.base_dir, "app/vector")
        self.faiss_path = os.path.join(self.vector_path, "index.faiss")
        self.pkl_path = os.path.join(self.vector_path, "index.pkl")
        self.batch_size = 5

        # FACE IMAGES
        self.face_images_path = os.path.join(self.project_dir, "storage/face-images")

        # BLOB MATCHING
        self.sure_know = 5
        self.sure_unknown = 5
        self.blob_life_time = 5
        self.blob_distance_threshold = 250

        # RECOGNITION
        self.recognition_k_neighbors = 3

core_config = CoreConfig()