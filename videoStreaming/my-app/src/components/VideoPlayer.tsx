'use client';

import { useEffect, useRef } from 'react';

export default function VideoPlayer({
  onStream,
}: {
  onStream: (stream: MediaStream) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          onStream(stream); // hand stream back to parent
        })
        .catch((err) => console.error('Webcam error:', err));
    }
  }, []);

  return <video ref={videoRef} className='border rounded w-full max-w-xl' />;
}
