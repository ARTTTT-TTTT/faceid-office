# face_tracking.py - คลาสสำหรับการติดตามใบหน้า
"""
รับผิดชอบการติดตามใบหน้าระหว่างเฟรม และการจัดการกลุ่มใบหน้า (Blob)
"""
import cv2

from app.core.temp.face_blob import FaceBlob


class FaceTracker:
    def __init__(self, config):
        """
        ตั้งค่าตัวติดตามใบหน้า

        Args:
            config: อ็อบเจ็กต์การตั้งค่าแอปพลิเคชัน
        """
        self.config = config
        self.blobs = []  # รายการ blobs ปัจจุบัน
        self.face_count = 0  # จำนวนใบหน้าทั้งหมดที่เคยพบ
        self.distance_threshold = config.blob_distance_threshold

    def is_near(self, pos1, pos2):
        """
        ตรวจสอบว่าตำแหน่งสองจุดอยู่ใกล้กันหรือไม่

        Args:
            pos1: ตำแหน่งที่ 1 (x, y)
            pos2: ตำแหน่งที่ 2 (x, y)

        Returns:
            bool: True ถ้าสองจุดอยู่ใกล้กัน
        """
        return (pos1[0] - pos2[0]) ** 2 + (
            pos1[1] - pos2[1]
        ) ** 2 < self.distance_threshold**2

    def update_tracking(self, face_data):
        """
        อัพเดทการติดตามใบหน้า

        Args:
            face_data: รายการข้อมูลใบหน้า [(position, image, person_name), ...]
        """
        matched_ids = set()

        # อัพเดทหรือสร้าง blobs ใหม่
        for pos, face, person_name in face_data:
            self.match_or_create_blob(pos, face, person_name, matched_ids)

        print("7")
        # ลด life และลบ blobs ที่หมดอายุ
        result = self.decrease_life_and_remove_blobs(matched_ids)
        return result

    def match_or_create_blob(self, pos, face, person_name, matched_ids):
        """
        จับคู่ใบหน้ากับ blob ที่มีอยู่หรือสร้าง blob ใหม่

        Args:
            pos: ตำแหน่งใบหน้า (x, y)
            face: ภาพใบหน้า
            person_name: ชื่อบุคคล
            matched_ids: เซ็ตที่เก็บ ID ของ blobs ที่ถูกจับคู่แล้ว
        """
        # ตรวจสอบว่าใกล้กับ blob ที่มีอยู่หรือไม่
        print("1")
        for blob in self.blobs:
            print("2")
            if self.is_near(blob.predict_position(), pos):
                print("3")
                blob.update(
                    position=pos,
                    image=face,
                    matched_person_name=person_name or blob.matched_person_name,
                )
                matched_ids.add(blob.id)
                return

        # สร้าง blob ใหม่
        print("4")
        blob_id = f"face_{self.face_count}"
        self.face_count += 1
        new_blob = FaceBlob(
            id=blob_id, position=pos, image=face, life_time=self.config.blob_life_time
        )
        print("5")
        new_blob.matched_person_name = person_name
        self.blobs.append(new_blob)

    def decrease_life_and_remove_blobs(self, matched_ids):
        """
        ลดอายุของ blobs ที่ไม่ได้ถูกจับคู่ และลบ blobs ที่หมดอายุ

        Args:
            matched_ids: เซ็ตที่เก็บ ID ของ blobs ที่ถูกจับคู่แล้ว
        """
        to_remove = []

        # ลดอายุของ blobs ที่ไม่ได้ถูกจับคู่
        for blob in self.blobs:
            print("8")
            if blob.id not in matched_ids:
                print("9")
                blob.life -= 1
                if blob.life <= 0:
                    to_remove.append(blob)

        # ลบ blobs ที่หมดอายุ
        for blob in to_remove:
            name, summary, img = blob.get_match_summary()
            self.blobs.remove(blob)
            if img is not None:
                img = cv2.resize(img, (500, 500))
                if name == "Unknown":
                    return False
                    cv2.imshow("Unknown", img)
                if name:
                    return True
                    cv2.imshow(f"{name}", img)

    def draw_tracking_info(self, frame):
        """
        วาดข้อมูลการติดตามลงบนเฟรม

        Args:
            frame: ภาพเฟรมที่ต้องการวาด

        Returns:
            frame: เฟรมที่วาดข้อมูลแล้ว
        """
        for blob in self.blobs:
            x, y = blob.position
            text = f"{blob.id}: {blob.matched_person_name or 'Unknown'}"
            cv2.putText(
                frame,
                text,
                (x - 40, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2,
            )
            cv2.circle(frame, (x, y), 5, (255, 0, 0), -1)

        return frame
