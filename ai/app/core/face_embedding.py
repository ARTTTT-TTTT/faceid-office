import cv2
import torch
import numpy as np
from PIL import Image
from facenet_pytorch import InceptionResnetV1
from app.configs.core_config import CoreConfig
from app.utils.transform_factory import face_transform


class FaceEmbedding:
    def __init__(self):
        self.config = CoreConfig()
        try:
            self.model_Facenet = (
                InceptionResnetV1(pretrained=self.config.face_embedder_model)
                .to(self.config.default_device)
                .eval()
            )
            self.transform = face_transform()
        except Exception as e:
            raise RuntimeError(
                f"Failed to load FaceNet model: {e}. Ensure the model is available and the path is correct."
            )

    def image_embedding(self, cropped_image):
        """Generate embedding for a cropped face image"""
        if cropped_image is None or not isinstance(cropped_image, np.ndarray):
            print("[ERROR] Invalid or empty image provided.")
            return None

        try:
            # Convert OpenCV image (BGR) to PIL RGB image
            pil_img = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))
        except Exception as e:
            print(f"[ERROR] Failed to convert image to PIL format: {e}")
            return None

        try:
            # Apply transformations
            tensor = self.transform(pil_img).unsqueeze(0).to(self.config.default_device)

            # Generate embedding
            with torch.no_grad():
                embedding = self.model_Facenet(tensor).cpu().numpy()[0]

            return embedding
        except Exception as e:
            print(f"[ERROR] Failed to generate embedding: {e}")
            return None
