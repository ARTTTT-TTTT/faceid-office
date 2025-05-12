from fastapi import APIRouter, Query

from app.services.setting import SettingService, RedisService
from app.models.setting import (
    Setting,
    SettingCreate,
    SettingUserLogExpireSeconds,
    SettingWorkStartTime,
)

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.post("/redis/start")
def start_redis(admin_id: str):
    result = RedisService.start(admin_id)
    return {"message": "Redis started successfully.", "result": result}


@router.post("/redis/stop")
def stop_redis(admin_id: str):
    RedisService.stop(admin_id)
    return {"message": "stopped and cleared successfully."}


@router.get("/redis/status")
def redis_status(
    admin_id: str = Query(..., description="Admin ID to check Redis status")
):
    result = RedisService.status(admin_id)
    return result


@router.get("/", response_model=Setting)
def get_setting():
    result = SettingService.get_setting()
    return result


@router.get("/user_log_expire_seconds", response_model=SettingUserLogExpireSeconds)
def get_user_log_expire_seconds():
    result = SettingService.get_user_log_expire_seconds()
    return {"user_log_expire_seconds": result}


@router.get("/work_start_time", response_model=SettingWorkStartTime)
def get_work_start_time():
    result = SettingService.get_work_start_time()
    return {"work_start_time": result}


@router.post("/")
def create_setting(user_log_expire_seconds: int, work_start_time: int):
    result: SettingCreate = SettingService.create_setting(
        user_log_expire_seconds, work_start_time
    )
    return {"message": "Created setting.", "setting": result}


@router.put("/user_log_expire_seconds")
def update_user_log_expire_seconds(user_log_expire_seconds: int):
    result: Setting = SettingService.update_user_log_expire_seconds(
        user_log_expire_seconds
    )
    return {"message": "Updated user log expire seconds.", "setting": result}


@router.put("/work_start_time")
def update_work_start_time(work_start_time: int):
    result: Setting = SettingService.update_work_start_time(work_start_time)
    return {"message": "Updated work start time.", "setting": result}
