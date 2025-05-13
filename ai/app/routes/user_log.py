from fastapi import APIRouter
from typing import List

from app.models.user_log import UserLog, UserLogUnlockAllUsers, UserLogUnlockUser
from app.services.user_log import UserLogService

router = APIRouter(prefix="/user_logs", tags=["User Logs"])


@router.get("", response_model=List[UserLog])
def get_all_user_logs():
    result = UserLogService.get_all_user_logs()
    return result


@router.get("/latest", response_model=List[UserLog])
def get_latest_user_logs():
    result = UserLogService.get_latest_user_logs()
    return result


@router.post("/unlock_all")
def unlock_all_users(payload: UserLogUnlockAllUsers):
    UserLogService.unlock_all_users(payload)
    return {"message": "All users have been unlocked."}


@router.post("/unlock")
def unlock_user(payload: UserLogUnlockUser):
    UserLogService.unlock_user(payload)
    return {"message": f"User '{payload.user_name}' has been unlocked."}
