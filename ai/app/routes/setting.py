from fastapi import APIRouter, Query

from app.services.setting import SettingService, RedisService
from app.models.setting import (
    Setting,
    SettingCreate,
    SettingUserLogExpireSeconds,
    SettingWorkStartTime,
    RedisStart,
    SettingCreatePayload,
    SettingUpdatePayload,
    RedisStartPayload,
    RedisStopPayload,
    RedisStartStatus,
    RedisStopStatus,
)

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.post(
    "/redis/start",
)
def start_redis(payload: RedisStartPayload):
    result: RedisStart = RedisService.start(payload.admin_id)
    return {"message": "Redis started successfully.", "result": result}


@router.post("/redis/stop")
def stop_redis(payload: RedisStopPayload):
    RedisService.stop(payload.admin_id)
    return {"message": "Stopped and cleared successfully."}


@router.get("/redis/status", response_model=RedisStartStatus | RedisStopStatus)
def redis_status(
    admin_id: str = Query(..., description="Admin ID to check Redis status")
):
    result = RedisService.status(admin_id)
    return result


@router.get("", response_model=Setting)
def get_setting():
    result = SettingService.get_setting()
    return result


@router.get("/user_log_expire_seconds", response_model=SettingUserLogExpireSeconds)
def get_user_log_expire_seconds():
    result = SettingService.get_user_log_expire_seconds()
    return SettingUserLogExpireSeconds(user_log_expire_seconds=result)


@router.get("/work_start_time", response_model=SettingWorkStartTime)
def get_work_start_time():
    result = SettingService.get_work_start_time()
    return SettingWorkStartTime(work_start_time=result)


@router.post("")
def create_setting(payload: SettingCreatePayload):
    result: SettingCreate = SettingService.create_setting(payload)
    return {"message": "Created setting.", "setting": result}


@router.put("")
def update_setting(payload: SettingUpdatePayload):
    result: Setting = SettingService.update_setting(payload)
    return {"message": "Updated setting.", "setting": result}


@router.put("/user_log_expire_seconds")
def update_user_log_expire_seconds(payload: SettingUserLogExpireSeconds):
    result: Setting = SettingService.update_user_log_expire_seconds(payload)
    return {"message": "Updated user log expire seconds.", "setting": result}


@router.put("/work_start_time")
def update_work_start_time(payload: SettingWorkStartTime):
    result: Setting = SettingService.update_work_start_time(payload)
    return {"message": "Updated work start time.", "setting": result}
