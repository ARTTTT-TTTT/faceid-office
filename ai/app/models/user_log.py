from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class UserLogStatus(str, Enum):
    on_time = "on_time"
    late = "late"

class UserLog(BaseModel):
    name: str
    status: UserLogStatus
    timestamp: datetime = datetime.utcnow()

    class Config:
      from_attributes = True
