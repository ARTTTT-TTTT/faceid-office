from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from bson import ObjectId
from enum import Enum


class UserLogStatus(str, Enum):
    ON_TIME = "on_time"
    LATE = "late"


class UserLog(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    status: UserLogStatus
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
        json_encoders = {ObjectId: str}


class UserLogCreate(BaseModel):
    name: str
    status: UserLogStatus
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
