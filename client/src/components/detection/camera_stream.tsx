'use client';

import { Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import logger from '@/lib/logger';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { sendImageForDetection } from '@/app/api/detection/route';

export const CameraStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraDenied, setCameraDenied] = useState(false);

  const startCamera = async () => {
    try {
      setCameraDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      intervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            analyzeFace(blob);
          }
        }, 'image/jpeg');
      }, 1000 / 1); // 1 FPS

      setIsCameraOn(true);
    } catch (error) {
      logger(error, '[CameraStream] Could not access the camera');
      setCameraDenied(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const analyzeFace = (imageBlob: Blob) => {
    sendImageForDetection(imageBlob);
  };

  useEffect(() => {
    stopCamera(); // ป้องกันซ้อนกัน
    return () => stopCamera();
  }, []);

  return (
    <Card className='col-span-5 h-full relative'>
      <CardContent className='p-4 h-full flex flex-col items-center justify-center gap-4 relative'>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controls={false}
          controlsList='nodownload nofullscreen noremoteplayback'
          className={`w-fit h-full object-cover rounded-xl pointer-events-none select-none ${
            !isCameraOn ? 'hidden' : ''
          }`}
        />

        {/* CANVAS FOR AI CAPTURE */}
        <canvas ref={canvasRef} className='hidden' />

        {/* CAMERA ON/OFF */}
        <Button
          onClick={toggleCamera}
          size='icon'
          className='absolute top-4 left-4 z-10 bg-gray-50 hover:bg-grey-100 text-black'
        >
          {isCameraOn ? (
            <VideoOff className='size-5' />
          ) : (
            <Video className='size-5' />
          )}
        </Button>

        {/* ICON CAMERA OFF */}
        {!isCameraOn && !cameraDenied && (
          <VideoOff className='absolute text-red-600 size-24' />
        )}

        {/* PERMISSION */}
        {cameraDenied && (
          <div className='text-center text-red-500 font-medium'>
            กรุณาอนุญาตการเข้าถึงกล้องก่อนใช้งาน
          </div>
        )}
      </CardContent>
    </Card>
  );
};
