'use client';

import { useWebRTC } from './useWebRTC';
import VideoPlayer from './VideoPlayer';

export default function VideoStream() {
  const { startPeer } = useWebRTC();

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>Live Object Detection</h1>
      <VideoPlayer onStream={startPeer} />
    </div>
  );
}
