import os
import cv2
from app.core.face_tracking import FaceTracking

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"


def main():
    # Initialize face tracking service
    tracking = FaceTracking()
    tracking.load_faiss_index()

    # Setup camera
    # === WINDOWS ===
    # cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    # cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    # cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 960)
    # cap.set(cv2.CAP_PROP_FPS, 5)

    # === MACOS ===
    cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            name = tracking.tracking_face(frame)
            print(f"Detected: {name}")

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
