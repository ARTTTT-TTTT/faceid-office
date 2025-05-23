import cv2
from aiortc import VideoStreamTrack


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
