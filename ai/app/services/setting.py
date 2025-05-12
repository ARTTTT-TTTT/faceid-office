from fastapi import HTTPException
from datetime import datetime
from bson import ObjectId

from app.constants.settings import settings
from app.database.redis import redis_client
from app.database.mongoDB import settings_collection
from app.models.setting import Setting, SettingCreate, RedisStart, RedisStatus_Status


class RedisService:
    admin_prefix = settings.ADMIN_PREFIX
    user_prefix = settings.USER_PREFIX
    tracking_suffix = settings.TRACKING_SUFFIX

    @classmethod
    def build_key(cls, admin_id: str, user_name: str = "*") -> str:
        return f"{cls.admin_prefix}:{admin_id}:{cls.user_prefix}:{user_name}"

    @classmethod
    def build_marker_key(cls, admin_id: str) -> str:
        return f"{cls.admin_prefix}:{admin_id}:{cls.tracking_suffix}"

    @classmethod
    def start(cls, admin_id: str) -> RedisStart:
        ttl_seconds = SettingService.get_user_log_expire_seconds()

        marker_key = cls.build_marker_key(admin_id)
        if redis_client.exists(marker_key):
            cls.stop(admin_id)

        try:
            if not redis_client.exists(marker_key):
                redis_client.setex(marker_key, ttl_seconds, "1")
                return {"admin": admin_id, "TTL": f"{ttl_seconds}s"}
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Already tracking admin {admin_id}, not resetting TTL.",
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to start tracking for admin {admin_id}: {str(e)}",
            )

    @classmethod
    def stop(cls, admin_id: str):
        pattern = cls.build_key(admin_id)
        marker_key = cls.build_marker_key(admin_id)

        try:
            keys = redis_client.keys(pattern)

            if keys or redis_client.exists(marker_key):
                if redis_client.exists(marker_key):
                    keys.append(marker_key)

                redis_client.delete(*keys)

            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"No tracking marker found for admin {admin_id}",
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to stop tracking for admin {admin_id}: {str(e)}",
            )

    @classmethod
    def status(cls, admin_id: str):
        marker_key = cls.build_marker_key(admin_id)

        try:
            if not redis_client.exists(marker_key):
                return {"admin": admin_id, "status": RedisStatus_Status.END}

            ttl_seconds = redis_client.ttl(marker_key)
            return {
                "admin": admin_id,
                "status": RedisStatus_Status.START,
                "ttl_seconds": ttl_seconds,
                "ttl_minutes": round(ttl_seconds / 60, 2),
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get tracking status for admin {admin_id}: {str(e)}",
            )


class SettingService:

    @classmethod
    def get_setting(cls) -> Setting:
        try:
            setting = settings_collection.find_one()
            if not setting:
                raise HTTPException(status_code=404, detail="Settings not found")
                # return cls.create_setting(7200, 9)

            setting["_id"] = str(setting.pop("_id"))
            return Setting(**setting)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to get settings: {str(e)}"
            )

    @staticmethod
    def get_user_log_expire_seconds() -> int:
        try:
            setting = settings_collection.find_one(
                {}, {"user_log_expire_seconds": 1, "_id": 0}
            )
            if not setting:
                raise HTTPException(status_code=404, detail="Settings not found")
            return setting["user_log_expire_seconds"]

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get user log expire seconds: {str(e)}",
            )

    @staticmethod
    def get_work_start_time() -> int:
        try:
            setting = settings_collection.find_one({}, {"work_start_time": 1, "_id": 0})
            if not setting:
                raise HTTPException(status_code=404, detail="Settings not found")
            return setting["work_start_time"]

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to get work start time: {str(e)}"
            )

    @classmethod
    def create_setting(
        cls, user_log_expire_seconds: int, work_start_time: int
    ) -> SettingCreate:
        try:
            setting = SettingCreate(
                user_log_expire_seconds=user_log_expire_seconds,
                work_start_time=work_start_time,
            )
            setting_data = setting.dict()
            settings_collection.insert_one(setting_data)

            return SettingCreate(**setting_data)

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to create settings: {str(e)}"
            )

    @classmethod
    def update_user_log_expire_seconds(cls, user_log_expire_seconds: int) -> Setting:
        try:
            setting = cls.get_setting()
            setting.user_log_expire_seconds = user_log_expire_seconds
            setting.updated_at = datetime.utcnow()

            result = settings_collection.update_one(
                {"_id": ObjectId(setting.id)}, {"$set": setting.dict(exclude={"id"})}
            )

            if result.matched_count == 0:
                raise HTTPException(
                    status_code=404, detail="Settings not found for update"
                )

            setting_data = setting.dict()
            setting_data["_id"] = str(setting.id)

            return Setting(**setting_data)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update user log expire seconds: {str(e)}",
            )

    @classmethod
    def update_work_start_time(cls, work_start_time: int) -> Setting:
        try:
            setting = cls.get_setting()
            setting.work_start_time = work_start_time
            setting.updated_at = datetime.utcnow()

            result = settings_collection.update_one(
                {"_id": ObjectId(setting.id)}, {"$set": setting.dict(exclude={"id"})}
            )

            if result.matched_count == 0:
                raise HTTPException(
                    status_code=404, detail="Settings not found for update"
                )

            setting_data = setting.dict()
            setting_data["_id"] = str(setting.id)

            return Setting(**setting_data)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update work start time: {str(e)}",
            )
