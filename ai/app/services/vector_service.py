import os
from app.core.vector import Vector
from app.configs.core_config import CoreConfig


class VectorService:
    def __init__(self, admin_id: str):
        self.core_config = CoreConfig(admin_id)
        self.vector = Vector(self.core_config)

    def build_empty_vectors(self) -> dict:
        try:
            result = self.vector.build_empty_vectors()
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_person_vectors(self, person_id: str) -> dict:
        if not os.path.exists(self.core_config.face_images_path + "/" + person_id):
            return {"success": False, "error": "Update path does not exist."}
        try:
            result = self.vector.update_person_vectors(person_id.strip())
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}

    def delete_person_vectors(self, person_id: str) -> dict:
        if not os.path.exists(self.core_config.face_images_path + "/" + person_id):
            return {"success": False, "error": "Delete path does not exist."}
        try:
            result = self.vector.delete_person_vectors(person_id.strip())
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}

    """
    ========== ADMIN ONLY ===========
    """

    def build_vectors(self) -> dict:
        if not os.path.exists(self.core_config.vector_path):
            return {"success": False, "error": "Vector path does not exist."}
        try:
            result = self.vector.build_vectors()
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_people_vectors(self) -> dict:
        if not os.path.exists(self.core_config.face_images_path):
            return {"success": False, "error": "Data path does not exist."}
        try:
            result = self.vector.get_people_vectors()
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_person_vectors(self, person_id: str) -> dict:
        if not os.path.exists(self.core_config.face_images_path + "/" + person_id):
            return {"success": False, "error": "Get path does not exist."}
        try:
            result = self.vector.get_person_vectors(person_id.strip())
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_total_vectors(self) -> dict:
        if not os.path.exists(self.core_config.face_images_path):
            return {"success": False, "error": "Data path does not exist."}
        try:
            result = self.vector.get_total_vectors()
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}
