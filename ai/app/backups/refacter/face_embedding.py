import cv2
from PIL import Image
from facenet_pytorch import InceptionResnetV1
from app.configs.core_config import CoreConfig
from app.utils.transform_factory import face_transform


class FaceEmbedding:
    def __init__(self):
        self.config = CoreConfig()
        self.model_Facenet = (
            InceptionResnetV1(pretrained=self.config.face_embedder_model)
            .to(self.config.default_device)
            .eval()
        )
        self.transform = face_transform()

    def image_embedding(self, cropped_image):
        """Generate embedding for a cropped face image"""
        pil_img = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))
        tensor = self.transform(pil_img).unsqueeze(0).to(self.config.default_device)
        embedding = self.model_Facenet(tensor).detach().cpu().numpy()[0]
        return embedding
