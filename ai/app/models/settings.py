from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from datetime import datetime

class Setting(BaseModel):
    user_log_expire_seconds: int
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
        json_encoders = {ObjectId: str}

class SettingUpdate(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_log_expire_seconds: int

class UserLogExpireRequest(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_log_expire_seconds: int