from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaBlackhole
from starlette.websockets import WebSocketDisconnect
from av import VideoFrame
from ultralytics import YOLO
import cv2
import numpy as np
import asyncio
import socketio

app = FastAPI()
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
socket_app = socketio.ASGIApp(sio, app)
pcs = set()

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class VideoProcessorTrack(VideoStreamTrack):
    kind = "video"

    def __init__(self, track):
        super().__init__()
        self.track = track
        self.frame_count = 0

    async def recv(self):
        frame = await self.track.recv()
        self.frame_count += 1

        img = frame.to_ndarray(format="bgr24")

        # Show video frame every 5 frames to reduce flicker
        if self.frame_count % 1 == 0:
            cv2.imshow("Backend Video", img)
            cv2.waitKey(1)  # Required to update OpenCV window

        return frame


class SDPModel(BaseModel):
    sdp: str
    type: str


@app.post("/offer")
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

    # # Convert to RTCSessionDescription
    # rtc_offer = RTCSessionDescription(sdp=offer.sdp, type=offer.type)

    # # Set remote description
    # await pc.setRemoteDescription(rtc_offer)

    # # Create and set local answer
    # answer = await pc.createAnswer()
    # await pc.setLocalDescription(answer)

    # # Return answer
    # return {
    #     "sdp": pc.localDescription.sdp,
    #     "type": pc.localDescription.type,
    # }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(1)  # Keep alive
    except WebSocketDisconnect:
        print("WebSocket client disconnected.")
