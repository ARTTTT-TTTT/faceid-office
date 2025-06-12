'use client';

import React, { useEffect, useRef, useState } from 'react';

import logger from '@/lib/logger';

interface FaceTrackingResult {
  id: string;
  name: string;
}
export default function VideoStreamV1() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteCanvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const userId = useRef<string>(crypto.randomUUID());
  const [trackingResult, setTrackingResult] = useState<
    FaceTrackingResult[] | null
  >(null);
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

        const ws = new WebSocket(`ws://localhost:8000/api/ai/ws/${userId}`);
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
                1, // คุณภาพลดลงนิดหน่อยเพื่อลดขนาดไฟล์
              );
            }
          };

          // 1 fps
          const intervalId = setInterval(sendFrame, 1000 / 10);

          // Cleanup ตอน component ถูก unmount
          return () => clearInterval(intervalId);
        };

        ws.onmessage = (event) => {
          // Try to detect if this is JSON text or a Blob
          if (typeof event.data === 'string') {
            try {
              const result = JSON.parse(event.data);
              //console.log('Face tracking result:', result);
              setTrackingResult(result); // ✅ Set state to display the result
            } catch (err) {
              //console.error('Failed to parse JSON:', err);
            }
          } else {
            // 🖼️ Assume it's a binary image (JPEG blob)
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
          }
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
      <h2 className='mb-2 text-lg font-semibold'>Local Camera (Your Feed)</h2>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className='mb-4 w-full rounded-xl shadow'
      />

      {trackingResult && ( // 🧠 Display face tracking results
        <div className='mt-4 rounded-lg bg-gray-100 p-4 shadow'>
          <h3 className='text-md mb-2 font-semibold'>Face Tracking Results</h3>
          <pre className='whitespace-pre-wrap text-sm'>
            {JSON.stringify(trackingResult, null, 2)}
          </pre>
        </div>
      )}
      <canvas ref={localCanvasRef} className='hidden' />

      <h2 className='mb-2 text-lg font-semibold'>
        Remote Stream (Processed by Server)
      </h2>
      <canvas
        ref={remoteCanvasRef}
        className='w-full rounded-xl border border-gray-300 bg-black shadow'
        style={{ aspectRatio: '16/9' }}
      />
    </main>
  );
}
