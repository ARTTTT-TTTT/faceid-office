from fastapi import HTTPException

from app.database.redis import redis_client
from app.constants.redis_keys import redis_keys


class RedisService:
    admin_prefix = redis_keys.ADMIN_PREFIX
    camera_prefix = redis_keys.CAMERA_PREFIX
    person_prefix = redis_keys.PERSON_PREFIX

    @classmethod
    def build_key(cls, admin_id: str, camera_prefix: str, person_id: str) -> str:
        return f"{cls.admin_prefix}:{admin_id}:{cls.camera_prefix}:{camera_prefix}:{cls.person_prefix}:{person_id}"

    @classmethod
    def check_detection_log(cls, admin_id: str, camera_id: str, person_id: str) -> bool:
        person_key = cls.build_key(
            admin_id=admin_id, camera_id=camera_id, person_id=person_id
        )

        try:
            if redis_client.exists(person_key):
                return False

            # ?OPTIONAL ให้ฝั่ง AI set detection_log ใน Redis
            # ?redis_client.set(person_key, "1")
            return True

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to check person {admin_id}: {str(e)}",
            )
