from app.core.face_blob import FaceBlob
from app.core.face_detection import FaceDetection
from app.core.face_embedding import FaceEmbedding
from app.core.face_recognition import FaceRecognition
from app.configs.core_config import CoreConfig


class FaceTracking:
    def __init__(self):
        self.config = CoreConfig()
        try:
            self.detection = FaceDetection()
            self.embedding = FaceEmbedding()
            self.recognition = FaceRecognition()

            self.id_counter = 0
            self.blobs = []
        except Exception as e:
            raise RuntimeError(
                f"Failed to initialize FaceTracking: {e}. Ensure all dependencies are installed."
            ) from e

    def load_faiss_index(self):
        """Load FAISS index for face recognition"""
        try:
            self.recognition.load_faiss_index()
        except Exception as e:
            print(f"[ERROR] Failed to load FAISS index: {e}")
            raise RuntimeError(
                "Failed to load FAISS index. Ensure the index file exists and is valid."
            ) from e

    def is_near(self, pos1, pos2):
        """Check if two positions are within the blob distance threshold"""
        try:
            dx, dy = pos1[0] - pos2[0], pos1[1] - pos2[1]
            return dx * dx + dy * dy < self.config.blob_distance_threshold**2
        except Exception as e:
            print(f"[ERROR] Error in is_near: {e}")
            return False

    def match_or_create_blob(self, position, face_img, matched_person, matched_ids):
        """Update existing blob if near, else create new blob"""
        try:
            for blob in self.blobs:
                if self.is_near(blob.predict_position(), position):
                    blob.update(
                        position=position,
                        image=face_img,
                        matched_person_name=matched_person or blob.matched_person_name,
                    )
                    matched_ids.add(blob.id)
                    return {
                        "id": blob.id,
                        "name": blob.matched_person_name,
                    }

            # หากไม่มี blob ใกล้เคียง สร้างใหม่
            blob_id = f"face_{self.id_counter}"
            self.id_counter += 1
            new_blob = FaceBlob(id=blob_id, position=position, image=face_img)
            new_blob.matched_person_name = matched_person
            self.blobs.append(new_blob)
            matched_ids.add(new_blob.id)

            return {
                "id": new_blob.id,
                "name": matched_person,
            }
        except Exception as e:
            print(f"[ERROR] Failed in match_or_create_blob: {e}")
            return {"id": None, "name": None}

    def decrease_life_and_cleanup(self, matched_ids=set()):
        """Decrease life of unmatched blobs and remove those expired"""
        try:
            to_remove = []
            for blob in self.blobs:
                if blob.id not in matched_ids:
                    blob.life -= 1
                    if blob.life <= 0:
                        to_remove.append(blob)
        except Exception as e:
            print(f"[ERROR] Error in decrease_life_and_cleanup: {e}")
        try:
            for blob in to_remove:
                self.blobs.remove(blob)

        except Exception as e:
            print(f"[ERROR] Error removing expired blobs: {e}")

    def tracking_face(self, frame):
        """Main method to track faces in a frame"""
        try:
            detections = self.detection.detect_faces(frame)

            # Check if detections is empty or invalid
            if not detections or not hasattr(detections, "boxes") or not detections.boxes:
                self.decrease_life_and_cleanup()
                return frame, []  # Return original frame and empty results

            # Generate annotations (bounding boxes, etc.)

            annotation = detections.plot()

            positions, face_images = self.detection.extract_faces_and_positions(frame, detections)
            matched_ids = set()
            results = []

            for position, face_img in zip(positions, face_images):
                embedding = self.embedding.image_embedding(face_img)
                matched_person = self.recognition.find_best_match(embedding)
                result = self.match_or_create_blob(position, face_img, matched_person, matched_ids)
                results.append(result)

            self.decrease_life_and_cleanup(matched_ids)
            if annotation is not None:
                return annotation, results  # Return annotated frame and results
            else:
                return frame, []  # Return annotated frame and results

        except Exception as e:
            print(f"Error in tracking_face: {e}")
            self.decrease_life_and_cleanup()
            # return frame, []  # Return original frame and empty results on error


face_tracking = FaceTracking()
