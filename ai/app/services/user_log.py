from app.constants.settings import settings
from app.database.redis import redis_client
from app.database.mongoDB import user_logs_collection
from app.models.user_log import UserLog, Status

def save_user_log(name: str, status: Status) -> bool:
    try:
        log = UserLog(name=name, status=status)

        log_data = log.dict()

        user_logs_collection.insert_one(log_data)
        return True
    except Exception as e:
        print(f"Error saving user log: {e}")
        return False


def should_log_user(name: str) -> bool:
    key = f"user_logged:{name}"
    if redis_client.exists(key):
        return False
    redis_client.setex(key, settings.USER_LOG_EXPIRE_SECONDS, "1")
    return True