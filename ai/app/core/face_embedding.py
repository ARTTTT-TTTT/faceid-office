import cv2
import numpy as np
from PIL import Image
import imagehash
from app.configs.core_config import CoreConfig

# ArcFace (InsightFace)
try:
    from insightface.app import FaceAnalysis  # type: ignore
except Exception:
    FaceAnalysis = None  # type: ignore


class FaceEmbedding:
    def __init__(self, core_config: CoreConfig):
        self.core_config = core_config
        self.embedding_cache: dict[str, np.ndarray] = {}

        if FaceAnalysis is None:
            raise RuntimeError(
                "InsightFace is not installed. Please ensure 'insightface' and 'onnxruntime-gpu' or 'onnxruntime' are installed."
            )
        try:
            backend = (self.core_config.face_embedder_model or "").lower()
            # Choose model pack; default to 'buffalo_l', allow 'antelopev2' when set
            self.arcface_pack = "antelopev2" if backend == "antelopev2" else "buffalo_l"
            cuda_available = self.core_config.default_device == "cuda"
            providers = (
                ["CUDAExecutionProvider", "CPUExecutionProvider"]
                if cuda_available
                else ["CPUExecutionProvider"]
            )
            self.model_ArcFace = FaceAnalysis(name=self.arcface_pack, providers=providers)
            self.model_ArcFace.prepare(ctx_id=0 if cuda_available else -1, det_size=(128, 128))
        except Exception as e:
            raise RuntimeError(f"Failed to initialize ArcFace (InsightFace): {e}")

    def get_perceptual_hash(self, cropped_image):
        """Generate perceptual hash for a face image"""
        if cropped_image is None or not isinstance(cropped_image, np.ndarray):
            return None
        try:
            pil_img = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))
            phash = imagehash.phash(pil_img)
            return str(phash)
        except Exception as e:
            print(f"[ERROR] Failed to generate perceptual hash: {e}")
            return None

    def image_embedding(self, cropped_image):
        """Generate embedding for a cropped face image with caching"""
        if cropped_image is None or not isinstance(cropped_image, np.ndarray):
            print("[ERROR] Invalid or empty image provided.")
            return None

        # Generate perceptual hash
        face_hash = self.get_perceptual_hash(cropped_image)

        # Check cache first
        if face_hash in self.embedding_cache:
            return self.embedding_cache[face_hash]

        try:
            # InsightFace expects BGR np.ndarray; it will detect+align within the crop
            faces = self.model_ArcFace.get(cropped_image)
            if not faces:
                # Attempt a quick resize to typical ArcFace input size and retry
                resized = cv2.resize(cropped_image, (160, 160))
                faces = self.model_ArcFace.get(resized)
            if not faces:
                print("[WARN] ArcFace could not find a face in the provided crop.")
                return None
            # Use the most confident detection from the crop
            face = max(faces, key=lambda f: getattr(f, "det_score", 0.0))
            embedding = face.normed_embedding.astype(np.float32)

            # Store in cache
            if face_hash is not None:
                self.embedding_cache[face_hash] = embedding
            return embedding

        except Exception as e:
            print(f"[ERROR] Failed to generate embedding: {e}")
            return None
