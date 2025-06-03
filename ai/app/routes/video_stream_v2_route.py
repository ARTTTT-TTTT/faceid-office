from fastapi import APIRouter
from livekit import api
import time
import hmac
import hashlib
import base64

from app.configs.app_config import app_config

router = APIRouter(prefix="/video-stream-v2", tags=["VIDEO STREAM V2"])


@router.get("/token")
def get_token(identity: str, room: str):
    token = (
        api.AccessToken(app_config.LIVEKIT_KEY, app_config.LIVEKIT_SECRET)
        .with_identity(identity)
        .with_grants(api.VideoGrants(room_join=True, room=room))
        .to_jwt()
    )
    return {"token": token}


@router.get("/turn_credentials")
def get_turn_credentials():
    username = f"{int(time.time()) + app_config.TURN_TTL}:livekit"
    key = app_config.TURN_SECRET.encode("utf-8")
    msg = username.encode("utf-8")
    credential = base64.b64encode(hmac.new(key, msg, hashlib.sha1).digest()).decode("utf-8")
    return {"username": username, "credential": credential}
