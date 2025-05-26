'use client';

import React, { useEffect, useRef } from 'react';

import logger from '@/lib/logger';

export default function VideoStream() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteCanvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const userId = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    let localVideoNode: HTMLVideoElement | null = null;

    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoNode = localVideoRef.current;
        }

        const ws = new WebSocket(
          `ws://localhost:8000/api/ai/video-stream/ws/video/${userId.current}`,
        );
        wsRef.current = ws;

        const localCanvas = localCanvasRef.current;
        const localContext = localCanvas?.getContext('2d');
        if (!localCanvas || !localContext) {
          logger('Local canvas or context not found.');
          return;
        }

        const remoteCanvas = remoteCanvasRef.current;
        const remoteContext = remoteCanvas?.getContext('2d');
        if (!remoteCanvas || !remoteContext) {
          logger('Remote canvas or context not found.');
          return;
        }

        const videoSender = document.createElement('video');
        videoSender.srcObject = stream;
        videoSender.muted = true;
        videoSender.play();

        videoSender.onplaying = () => {
          localCanvas.width = videoSender.videoWidth;
          localCanvas.height = videoSender.videoHeight;
          remoteCanvas.width = videoSender.videoWidth;
          remoteCanvas.height = videoSender.videoHeight;

          const sendFrame = () => {
            if (ws.readyState === WebSocket.OPEN) {
              localContext.drawImage(
                videoSender,
                0,
                0,
                localCanvas.width,
                localCanvas.height,
              );
              localCanvas.toBlob(
                (blob) => {
                  if (blob) {
                    blob.arrayBuffer().then((buffer) => {
                      ws.send(buffer);
                    });
                  }
                },
                'image/jpeg',
                0.8,
              );
            }
            requestAnimationFrame(sendFrame);
          };
          sendFrame();
        };

        ws.onmessage = (event) => {
          const blob = new Blob([event.data], { type: 'image/jpeg' });
          const img = new Image();

          img.onload = () => {
            remoteContext.clearRect(
              0,
              0,
              remoteCanvas.width,
              remoteCanvas.height,
            );
            remoteContext.drawImage(
              img,
              0,
              0,
              remoteCanvas.width,
              remoteCanvas.height,
            );
            URL.revokeObjectURL(img.src);
          };
          img.src = URL.createObjectURL(blob);
        };

        ws.onopen = () => logger('WebSocket connected.');
        ws.onclose = () => logger('WebSocket disconnected.');
        ws.onerror = (error) => logger(error, 'WebSocket error:');
      } catch (error) {
        logger(error, 'Error accessing camera or starting stream:');
      }
    };

    startStream();

    return () => {
      wsRef.current?.close();
      if (localVideoNode && localVideoNode.srcObject) {
        (localVideoNode.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);
  return (
    <main className='p-4'>
      <h2 className='text-lg font-semibold mb-2'>Local Camera (Your Feed)</h2>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className='w-full rounded-xl shadow mb-4'
      />
      <canvas ref={localCanvasRef} className='hidden' />

      <h2 className='text-lg font-semibold mb-2'>
        Remote Stream (Processed by Server)
      </h2>
      <canvas
        ref={remoteCanvasRef}
        className='w-full rounded-xl shadow border border-gray-300 bg-black'
        style={{ aspectRatio: '16/9' }}
      />
    </main>
  );
}
