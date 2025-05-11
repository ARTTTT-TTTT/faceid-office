import redis
from datetime import datetime
from app.constants.settings import settings
from app.models.settings import Setting, SettingUpdate
from app.database.mongoDB import settings_collection


class RedisService:
    _redis_client = None
    _enabled = False



    @classmethod
    def start(cls):
        if not cls._enabled:
            try:
                cls._redis_client = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    db=0,
                    decode_responses=True
                )
                cls._redis_client.ping()
                cls._enabled = True

                # Set test key
                current_setting = SettingService.get_setting()
                cls._redis_client.setex("test_key", current_setting.user_log_expire_seconds, "1")

                return {"message": "Redis started."}
            except Exception as e:
                cls._redis_client = None
                cls._enabled = False
                raise RuntimeError(f"Failed to start Redis: {str(e)}")

        return {"message": "Redis already started."}

    @classmethod
    def stop_and_clear(cls):
        if cls._redis_client:
            try:
                cls._redis_client.flushdb()
                cls._redis_client.close()
            except Exception as e:
                raise RuntimeError(f"Failed to stop Redis: {str(e)}")
            finally:
                cls._redis_client = None
                cls._enabled = False
                return {"message": "Redis stopped and cache cleared."}
        return {"message": "Redis is not running."}

    @classmethod
    def get_client(cls):
        if not cls._enabled or cls._redis_client is None:
            raise Exception("Redis is not started")
        return cls._redis_client

    @classmethod
    def is_enabled(cls):
        return cls._enabled


class SettingService:
    @staticmethod
    def get_setting() -> Setting:
        setting_data = settings_collection.find_one()
        if not setting_data:
            default = {
                "user_log_expire_seconds": 7200,
                "updated_at": datetime.utcnow()
            }
            result = settings_collection.insert_one(default)
            setting_data = settings_collection.find_one({"_id": result.inserted_id})
        return Setting(**setting_data)

    @staticmethod
    def set_user_log_expire_seconds(user_log_expire_seconds: int):
        settings_collection.update_one(
            {},  # update first (or only) document
            {
                "$set": {
                    "user_log_expire_seconds": user_log_expire_seconds,
                    "updated_at": datetime.utcnow()
                }
            },
        )

        # Update Redis key if enabled
        if RedisService.is_enabled():
            RedisService.get_client().setex("test_key", user_log_expire_seconds, "1")

        return {"message": "Setting updated", "user_log_expire_seconds": user_log_expire_seconds}
