import cv2
from app.backups.refacter.face_blob import FaceBlob
from app.backups.refacter.face_detection import FaceDetection
from app.backups.refacter.face_embedding import FaceEmbedding
from app.backups.refacter.face_recognition import FaceRecognition
from app.constants.core_config import CoreConfig


class FaceTracking:
    def __init__(self):
        self.config = CoreConfig()
        self.detection = FaceDetection()
        self.embedding = FaceEmbedding()
        self.recognition = FaceRecognition()

        self.id_face = 0
        self.blobs = []

    def load_faiss_index(self):
        """Load FAISS index for face recognition"""
        self.recognition.load_faiss_index()

    def match_or_create_blob(self, pos, face, person, matched_ids):
        """Match position to existing blob or create new one"""
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
        """Check if two positions are near each other"""
        return (pos1[0] - pos2[0]) ** 2 + (
            pos1[1] - pos2[1]
        ) ** 2 < self.config.blob_distance_threshold**2

    def decrease_life_and_remove(self, matched_ids=set()):
        """Decrease life of unmatched blobs and remove expired ones"""
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
                f"[REMOVE] {blob.id} → Most likely matched: {name} Summarize: {summary}]"
            )
            self.blobs.remove(blob)

    def tracking_face(self, frame):
        """Main face tracking function"""
        detections = self.detection.detect_faces(frame)
        annotated_frame = detections.plot()

        if not detections.boxes:
            self.decrease_life_and_remove()
            return annotated_frame, self.blobs

        positions, faces = self.detection.extract_faces_and_positions(frame, detections)
        matched = set()

        for pos, face in zip(positions, faces):
            embedding = self.embedding.image_embedding(face)
            person = self.recognition.find_best_match(embedding)
            self.match_or_create_blob(pos, face, person, matched)

        self.decrease_life_and_remove(matched_ids=matched)
        return annotated_frame, self.blobs
