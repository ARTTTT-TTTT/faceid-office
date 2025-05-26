from app.core.face_blob import FaceBlob
from app.core.face_detection import FaceDetection
from app.core.face_embedding import FaceEmbedding
from app.core.face_recognition import FaceRecognition
from app.constants.core_config import CoreConfig


class FaceTracking:
    def __init__(self):
        self.config = CoreConfig()
        self.detection = FaceDetection()
        self.embedding = FaceEmbedding()
        self.recognition = FaceRecognition()

        self.id_counter = 0
        self.blobs = []

    def load_faiss_index(self):
        """Load FAISS index for face recognition"""
        self.recognition.load_faiss_index()

    def is_near(self, pos1, pos2):
        """Check if two positions are within the blob distance threshold"""
        dx, dy = pos1[0] - pos2[0], pos1[1] - pos2[1]
        return dx * dx + dy * dy < self.config.blob_distance_threshold**2

    def match_or_create_blob(self, position, face_img, matched_person, matched_ids):
        """Update existing blob if near, else create new blob"""
        for blob in self.blobs:
            if self.is_near(blob.predict_position(), position):
                blob.update(
                    position=position,
                    image=face_img,
                    matched_person_name=matched_person or blob.matched_person_name,
                )
                matched_ids.add(blob.id)
                return

        blob_id = f"face_{self.id_counter}"
        self.id_counter += 1
        new_blob = FaceBlob(id=blob_id, position=position, image=face_img)
        new_blob.matched_person_name = matched_person
        self.blobs.append(new_blob)
        matched_ids.add(new_blob.id)

    def decrease_life_and_cleanup(self, matched_ids=set()):
        """Decrease life of unmatched blobs and remove those expired"""
        to_remove = []
        for blob in self.blobs:
            if blob.id not in matched_ids:
                blob.life -= 1
                if blob.life <= 0:
                    to_remove.append(blob)
        for blob in to_remove:
            name, img = blob.get_match_summary()
            if img is not None:
                return name
            self.blobs.remove(blob)

    def tracking_face(self, frame):
        """Main method to track faces in a frame"""
        detections = self.detection.detect_faces(frame)
        annotated_frame = detections.plot()

        if not detections.boxes:
            name = self.decrease_life_and_cleanup()
            return name

        positions, face_images = self.detection.extract_faces_and_positions(
            frame, detections
        )
        matched_ids = set()

        for position, face_img in zip(positions, face_images):
            embedding = self.embedding.image_embedding(face_img)
            matched_person = self.recognition.find_best_match(embedding)
            self.match_or_create_blob(position, face_img, matched_person, matched_ids)

        name = self.decrease_life_and_cleanup(matched_ids)
        return name
