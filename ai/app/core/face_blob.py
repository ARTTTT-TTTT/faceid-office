import cv2
import numpy as np
from app.constants.core_config import CoreConfig


class FaceBlob:
    def __init__(self, id, position, image=None):
        self.config = CoreConfig()
        self.id = id
        self.image = image
        self.position = position
        self.life = self.config.blob_life_time

        self.matched_person_name = None
        self.match_history = {}

        self.kalman = cv2.KalmanFilter(4, 2)
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
        self.position = position
        self.image = image

        self.kalman.correct(np.array([[position[0]], [position[1]]], dtype=np.float32))

        self.matched_person_name = matched_person_name
        self.match_history[matched_person_name] = (
            self.match_history.get(matched_person_name, 0) + 1
        )

    def get_match_summary(self):
        valid_named = {
            name: count
            for name, count in self.match_history.items()
            if name != "Unknown" and count >= self.config.sure_know
        }

        best_match_name, best_match_count = (None, 0)
        if valid_named:
            best_match_name, best_match_count = max(
                valid_named.items(), key=lambda x: x[1]
            )

        unknown_count = self.match_history.get("Unknown", 0)

        # * UNKNOWN PERSON
        if unknown_count >= max(self.config.sure_unknown, best_match_count * 2):
            return "Unknown", self.image

        # * FOUND PERSON
        if best_match_name and unknown_count <= best_match_count * 2:
            return best_match_name, self.image

        return None, None
