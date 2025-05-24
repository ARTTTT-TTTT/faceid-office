from fastapi import APIRouter
from livekit import api
import time
import hmac
import hashlib
import base64

from app.constants.app_config import settings

router = APIRouter(prefix="/video-stream-v2", tags=["VIDEO STREAM V2"])


@router.get("/token")
def get_token(identity: str, room: str):
    token = (
        api.AccessToken(settings.LIVEKIT_KEY, settings.LIVEKIT_SECRET)
        .with_identity(identity)
        .with_grants(api.VideoGrants(room_join=True, room=room))
        .to_jwt()
    )
    return {"token": token}


@router.get("/turn_credentials")
def get_turn_credentials():
    username = f"{int(time.time()) + settings.TURN_TTL}:livekit"
    key = settings.TURN_SECRET.encode("utf-8")
    msg = username.encode("utf-8")
    credential = base64.b64encode(hmac.new(key, msg, hashlib.sha1).digest()).decode(
        "utf-8"
    )
    return {"username": username, "credential": credential}
