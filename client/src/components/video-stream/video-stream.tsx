'use client';

import { useWebRTC } from './useWebRTC';
import { VideoPlayer } from './video-player';

export default function VideoStream() {
  const { startPeer, detectionResult } = useWebRTC();

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Live Object Detection</h1>
      <VideoPlayer onStream={startPeer} />

      {detectionResult && (
        <div className='bg-black-100 border p-4 rounded shadow-md'>
          <h2 className='font-semibold mb-2'>Detection Result:</h2>
          <pre className='text-sm whitespace-pre-wrap break-words'>
            {JSON.stringify(detectionResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
