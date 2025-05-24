'use client';

import React, { useEffect, useRef } from 'react';

export default function VideoStreamV1() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const userId = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    const startStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const ws = new WebSocket(
        `ws://localhost:8000/api/ai/video-stream-v1/ws/video/${userId.current}`,
      );
      wsRef.current = ws;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onplaying = () => {
        const sendFrame = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob && ws.readyState === WebSocket.OPEN) {
              blob.arrayBuffer().then((buffer) => {
                ws.send(buffer);
              });
            }
            requestAnimationFrame(sendFrame);
          }, 'image/jpeg');
        };
        sendFrame();
        ws.onmessage = (event) => {
          const blob = new Blob([event.data], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          if (remoteVideoRef.current) remoteVideoRef.current.src = url;
        };
      };
    };

    startStream();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  return (
    <div className='grid grid-cols-2 gap-4 p-4'>
      <div>
        <h2 className='text-lg font-semibold mb-2'>Local Camera</h2>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className='w-full rounded-xl shadow'
        />
      </div>
      <h2 className='text-lg font-semibold mb-2'>Processed Stream</h2>
      <canvas ref={canvasRef} className='hidden' />
    </div>
  );
}
