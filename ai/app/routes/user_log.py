from fastapi import APIRouter, HTTPException
from typing import List

from app.database.mongoDB import user_logs_collection
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
