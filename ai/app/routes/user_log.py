from fastapi import APIRouter, HTTPException
from typing import List

from app.database.mongoDB import user_logs_collection
from app.database.redis import redis_client 
from app.models.user_log import UserLog

router = APIRouter(prefix="/user_logs", tags=["User Logs"])

@router.get("/", response_model=List[UserLog])
def get_all_user_logs():
    try:
        logs = []
        for log in user_logs_collection.find():
            log["_id"] = str(log["_id"])
            logs.append(UserLog(**log))
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/latest", response_model=List[UserLog])
def get_latest_user_logs():
    try:
        logs = []
        for log in user_logs_collection.find().sort("timestamp", -1).limit(5):
            log["_id"] = str(log["_id"])
            logs.append(UserLog(**log))
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
      
@router.post("/unlock")
def unlock_all_users():
    try:
        keys = redis_client.keys("user_logged:*")
        if not keys:
            raise HTTPException(status_code=404, detail="No locked users found.")
        deleted = redis_client.delete(*keys)
        return {"message": f"Unlocked {deleted} users."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unlock users: {str(e)}")

@router.post("/unlock/{username}")
def unlock_user(username: str):
    try:
        key = f"user_logged:{username}"
        deleted = redis_client.delete(key)
        if deleted == 0:
            raise HTTPException(status_code=404, detail=f"User '{username}' is not locked or key not found.")
        return {"message": f"User '{username}' has been unlocked."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unlock user: {str(e)}")