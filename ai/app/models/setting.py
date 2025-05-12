from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from bson import ObjectId
from enum import Enum


class RedisStatus_Status(str, Enum):
    START = "start"
    END = "end"


class RedisStart(BaseModel):
    admin: str
    TTL: str

    class Config:
        from_attributes = True


class Setting(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_log_expire_seconds: int
    work_start_time: int
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
        json_encoders = {ObjectId: str}


class SettingCreate(BaseModel):
    user_log_expire_seconds: int
    work_start_time: int
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


class SettingUserLogExpireSeconds(BaseModel):
    user_log_expire_seconds: int


class SettingWorkStartTime(BaseModel):
    work_start_time: int
