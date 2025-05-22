import os
from app.core.vector import Vector
from app.constants.core_config import CoreConfig

# !FEATURE HANDLE RESPONSE


class VectorService:
    def __init__(self):
        self.config = CoreConfig()
        self.vector = Vector()

    def get_people_vectors(self) -> dict:
        if not os.path.exists(self.config.face_images_path):
            return {"success": False, "error": "Data path does not exist."}
        try:
            result = self.vector.get_people_vectors()
            return {"succes": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_person_vectors(self, person_id: str) -> dict:
        if not os.path.exists(self.config.face_images_path + "/" + person_id):
            return {"success": False, "error": "Get path does not exist."}
        try:
            result = self.vector.get_person_vectors(person_id.strip())
            return {"succes": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_total_vectors(self) -> dict:
        if not os.path.exists(self.config.face_images_path):
            return {"success": False, "error": "Data path does not exist."}
        try:
            result = self.vector.get_total_vectors()
            return {"succes": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def build_vectors(self) -> dict:
        if not os.path.exists(self.config.face_images_path):
            return {"success": False, "error": "Data path does not exist."}
        try:
            result = self.vector.build_vectors()
            return {"success": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_person_vectors(self, person_id: str) -> dict:
        if not os.path.exists(self.config.face_images_path + "/" + person_id):
            return {"success": False, "error": "Update path does not exist."}
        try:
            result = self.vector.update_person_vectors(person_id.strip())
            return {"success": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def delete_person_vectors(self, person_id: str) -> dict:
        if not os.path.exists(self.config.face_images_path + "/" + person_id):
            return {"success": False, "error": "Delete path does not exist."}
        try:
            result = self.vector.delete_person_vectors(person_id.strip())
            return {"success": result}
        except Exception as e:
            return {"success": False, "error": str(e)}
