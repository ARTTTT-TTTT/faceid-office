from fastapi import APIRouter
from jose import jwt
from datetime import datetime, timedelta

LIVEKIT_KEY = "livekitkey"
LIVEKIT_SECRET = "livekitsecret"

router = APIRouter(prefix="/video-stream-v2", tags=["VIDEO STREAM V2"])


@router.get("/get_token")
def get_token(identity: str, room: str):
    payload = {
        "iss": LIVEKIT_KEY,
        "sub": identity,
        "exp": datetime.utcnow() + timedelta(hours=1),
        "nbf": datetime.utcnow(),
        "video": {
            "roomJoin": True,
            "room": room,
        },
    }

    token = jwt.encode(payload, LIVEKIT_SECRET, algorithm="HS256")
    return {"token": token}
