'use client';

import { useEffect, useRef } from 'react';

import logger from '@/lib/logger';

export function VideoPlayer({
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
            logger(stream, '🔧 Stream started');
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          onStream(stream);
        })
        .catch((err) => logger(err, 'Webcam error:'));
    }
  }, [onStream]);

  return <video ref={videoRef} className='border rounded w-full max-w-xl' />;
}
