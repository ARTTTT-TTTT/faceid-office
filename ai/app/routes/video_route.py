from fastapi import APIRouter, WebSocket
from pydantic import BaseModel
from aiortc import RTCPeerConnection, RTCSessionDescription
from starlette.websockets import WebSocketDisconnect
import asyncio

from app.services.video_service import VideoProcessorTrack

router = APIRouter(prefix="/videos", tags=["VIDEOS"])
pcs = set()


class SDPModel(BaseModel):
    sdp: str
    type: str


@router.post("/offer")
async def offer(offer: SDPModel):
    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("iceconnectionstatechange")
    async def on_ice_state_change():
        print("ICE connection state is %s" % pc.iceConnectionState)
        if pc.iceConnectionState == "failed":
            await pc.close()
            pcs.discard(pc)

    @pc.on("track")
    def on_track(track):
        print("Track received:", track.kind)
        if track.kind == "video":
            processor = VideoProcessorTrack(track)
            pc.addTrack(processor)

    rtc_offer = RTCSessionDescription(sdp=offer.sdp, type=offer.type)
    await pc.setRemoteDescription(rtc_offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type,
    }


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(1)  # Keep alive
    except WebSocketDisconnect:
        print("WebSocket client disconnected.")
