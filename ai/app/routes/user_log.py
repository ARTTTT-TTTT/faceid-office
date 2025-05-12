from fastapi import APIRouter
from typing import List

from app.database.redis import redis_client
from app.models.user_log import UserLog
from app.services.user_log import UserLogService

router = APIRouter(prefix="/user_logs", tags=["User Logs"])


@router.get("/", response_model=List[UserLog])
def get_all_user_logs():
    result = UserLogService.get_all_user_logs()
    return result


@router.get("/latest", response_model=List[UserLog])
def get_latest_user_logs():
    result = UserLogService.get_latest_user_logs()
    return result


@router.post("/unlock_all")
def unlock_all_users(admin_id: str):
    UserLogService.unlock_all_users(admin_id)
    return {"message": "All users have been unlocked."}


@router.post("/unlock")
def unlock_user(admin_id: str, username: str):
    UserLogService.unlock_user(admin_id, username)
    return {"message": f"User '{username}' has been unlocked."}
