# main.py - จุดเริ่มต้นของโปรแกรม
"""
จุดเริ่มต้นโปรแกรม ทำหน้าที่เชื่อมต่อกับกล้อง และประมวลผลภาพแบบเรียลไทม์
"""
import cv2

from app.constants.core_config import CoreConfig
from app.core.face_detection import FaceDetector
from app.core.face_recognition import FaceRecognizer
from app.core.face_tracking import FaceTracker

def main():
    config = CoreConfig()
    detector = FaceDetector(config)
    recognizer = FaceRecognizer(config)
    tracker = FaceTracker(config)

    # เชื่อมต่อกับกล้อง
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 960)
    cap.set(cv2.CAP_PROP_FPS, 5)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # ตรวจจับใบหน้า
        detections = detector.detect(frame)

        # แยกตำแหน่งและภาพใบหน้า
        positions, faces = detector.extract_faces(frame, detections)

        # ระบุตัวตนและติดตามใบหน้า
        face_data = []
        for pos, face in zip(positions, faces):
            embedding = recognizer.extract_embedding(face)
            person_name = recognizer.identify_person(embedding)
            face_data.append((pos, face, person_name))

        # อัพเดทการติดตามใบหน้า
        tracker.update_tracking(face_data)

        # วาดผลลัพธ์บนเฟรม
        annotated_frame = detector.draw_detections(frame, detections)
        annotated_frame = tracker.draw_tracking_info(annotated_frame)

        # แสดงผลลัพธ์
        cv2.imshow("Face Tracking", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
