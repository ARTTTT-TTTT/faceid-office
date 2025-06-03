import { Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import logger from '@/lib/logger';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { sendImageForDetection } from '@/app/api/detection/route';

interface CameraStreamProps {
  onUserDetected: () => void;
  admin_id: string;
  work_start_time: number;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  onUserDetected,
  admin_id,
  work_start_time,
}: CameraStreamProps) => {
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

  const analyzeFace = async (imageBlob: Blob) => {
    const detectionResult = await sendImageForDetection(
      imageBlob,
      admin_id,
      work_start_time,
    );

    if (detectionResult) {
      if (detectionResult.status === 201) {
        onUserDetected();
      } else {
        logger('ℹ️ ตรวจจับได้แต่ไม่บันทึก:', detectionResult.result);
      }
    } else {
      logger('❌ การเรียก API ล้มเหลว');
    }
  };

  useEffect(() => {
    stopCamera(); // ป้องกันซ้อนกัน
    return () => stopCamera();
  }, []);

  return (
    <Card className='relative col-span-5 h-full'>
      <CardContent className='relative flex h-full flex-col items-center justify-center gap-4 p-4'>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controls={false}
          controlsList='nodownload nofullscreen noremoteplayback'
          className={`pointer-events-none h-full w-fit select-none rounded-xl object-cover ${
            !isCameraOn ? 'hidden' : ''
          }`}
        />

        {/* CANVAS FOR AI CAPTURE */}
        <canvas ref={canvasRef} className='hidden' />

        {/* CAMERA ON/OFF */}
        <Button
          onClick={toggleCamera}
          size='icon'
          className='hover:bg-grey-100 absolute left-4 top-4 z-10 bg-gray-50 text-black'
        >
          {isCameraOn ? (
            <VideoOff className='size-5' />
          ) : (
            <Video className='size-5' />
          )}
        </Button>

        {/* ICON CAMERA OFF */}
        {!isCameraOn && !cameraDenied && (
          <VideoOff className='absolute size-24 text-red-600' />
        )}

        {/* PERMISSION */}
        {cameraDenied && (
          <div className='text-center font-medium text-red-500'>
            กรุณาอนุญาตการเข้าถึงกล้องก่อนใช้งาน
          </div>
        )}
      </CardContent>
    </Card>
  );
};
