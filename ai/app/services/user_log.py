from fastapi import HTTPException

from app.constants.settings import settings
from app.database.redis import redis_client
from app.database.mongoDB import user_logs_collection
from app.models.user_log import (
    UserLogCreate,
    UserLogStatus,
    UserLog,
    UserLogUnlockAllUsers,
    UserLogUnlockUser,
)


class UserLogService:
    admin_prefix = settings.ADMIN_PREFIX
    user_prefix = settings.USER_PREFIX

    @classmethod
    def build_key(cls, admin_id: str, user_name: str = "*") -> str:
        return f"{cls.admin_prefix}:{admin_id}:{cls.user_prefix}:{user_name}"

    @staticmethod
    def save_user_log(name: str, status: UserLogStatus) -> bool:
        try:
            log = UserLogCreate(name=name, status=status)
            log_data = log.dict()
            user_logs_collection.insert_one(log_data)
            return True
        except Exception as e:
            return False

    @classmethod
    def should_log_user(cls, admin_id: str, name: str) -> bool:
        user_key = cls.build_key(admin_id=admin_id, user_name=name)

        try:

            if redis_client.exists(user_key):
                return False

            redis_client.set(user_key, "1")
            return True

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to check user log for admin {admin_id}: {str(e)}",
            )

    @staticmethod
    def get_all_user_logs() -> list[UserLog]:
        try:
            logs = []
            for log in user_logs_collection.find():
                log["_id"] = str(log["_id"])
                logs.append(UserLog(**log))
            return logs
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to get all user logs: {str(e)}"
            )

    @staticmethod
    def get_latest_user_logs() -> list[UserLog]:
        try:
            logs = []
            for log in user_logs_collection.find().sort("timestamp", -1).limit(5):
                log["_id"] = str(log["_id"])
                logs.append(UserLog(**log))
            return logs
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to get latest user logs: {str(e)}"
            )

    @classmethod
    def unlock_all_users(cls, payload: UserLogUnlockAllUsers):
        pattern = cls.build_key(payload.admin_id)

        try:
            keys = redis_client.keys(pattern)
            if not keys:
                raise HTTPException(
                    status_code=404,
                    detail=f"No locked users found.",
                )
            redis_client.delete(*keys)

        except Exception as e:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to unlock users: {str(e)}"
            )

    @classmethod
    def unlock_user(cls, payload: UserLogUnlockUser):
        pattern = cls.build_key(payload.admin_id, payload.user_name)

        try:
            deleted = redis_client.delete(pattern)
            if deleted == 0:
                raise HTTPException(
                    status_code=404,
                    detail=f"User '{payload.user_name}' is not locked or key not found.",
                )

        except Exception as e:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to unlock user: {str(e)}"
            )
