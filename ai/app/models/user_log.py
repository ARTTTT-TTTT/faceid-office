from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class Status(str, Enum):
    on_time = "on_time"
    late = "late"

class UserLog(BaseModel):
    name: str
    status: Status
    timestamp: datetime = datetime.utcnow()

    class Config:
      from_attributes = True
