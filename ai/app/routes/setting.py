from app.models.settings import UserLogExpireRequest
from app.services.setting import RedisService, SettingService
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/setting", tags=["Setting Control"])

@router.post("/redis/start")
def start_redis():
    try:
        return RedisService.start()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start Redis: {str(e)}")

@router.post("/redis/stop")
def stop_redis():
    try:
        return RedisService.stop_and_clear()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop Redis: {str(e)}")

@router.get("/redis/status")
def redis_status():
    try:
        return {"enabled": RedisService.is_enabled()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check Redis status: {str(e)}")
    
@router.get("/user_log_expire_seconds")
def get_user_log_expire_seconds():
    try:
        setting = SettingService.get_setting()
        return {"user_log_expire_seconds": setting.user_log_expire_seconds}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user_log_expire_seconds")
def set_user_log_expire_seconds(request: UserLogExpireRequest):
    try:
        result = SettingService.set_user_log_expire_seconds(request.user_log_expire_seconds)
        return {
            "message": "Setting updated.",
            "user_log_expire_seconds": result["user_log_expire_seconds"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
