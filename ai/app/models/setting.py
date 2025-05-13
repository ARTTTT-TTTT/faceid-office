from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from bson import ObjectId
from enum import Enum

# === RESPONSE ===


class RedisStatus(str, Enum):
    START = "start"
    END = "end"


class RedisStart(BaseModel):
    admin: str
    TTL: str


class RedisStopStatus(BaseModel):
    admin: str
    status: RedisStatus


class RedisStartStatus(BaseModel):
    admin: str
    status: RedisStatus
    ttl_seconds: int
    ttl_minutes: float


class Setting(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_log_expire_seconds: int
    work_start_time: int
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        validate_by_name = True
        json_encoders = {ObjectId: str}


class SettingCreate(BaseModel):
    user_log_expire_seconds: int
    work_start_time: int
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# === REQUEST ===


class RedisStartPayload(BaseModel):
    admin_id: str


class RedisStopPayload(BaseModel):
    admin_id: str


class SettingCreatePayload(BaseModel):
    user_log_expire_seconds: int
    work_start_time: int


class SettingUpdatePayload(BaseModel):
    id: str = Field(alias="_id")
    user_log_expire_seconds: int
    work_start_time: int


# === RESPONSE && REQUEST ===


class SettingUserLogExpireSeconds(BaseModel):
    user_log_expire_seconds: int


class SettingWorkStartTime(BaseModel):
    work_start_time: int
