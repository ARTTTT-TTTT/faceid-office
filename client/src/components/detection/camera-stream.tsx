import { CameraOff, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { CameraStreamControl } from '@/components/detection/camera-stream-control';

export const CameraStream: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const remoteCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isWsLoading, setIsWsLoading] = useState(true);

  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <section className='flex size-full flex-col items-center justify-center gap-2 border bg-gray-100'>
      <CameraStreamControl
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        localVideoRef={localVideoRef}
        localCanvasRef={localCanvasRef}
        remoteCanvasRef={remoteCanvasRef}
        setIsWsLoading={setIsWsLoading}
      />

      {/* DETECTED PERSON CAMERA STREAM */}
      <article className='flex size-full flex-col items-center justify-center gap-2'>
        {!isStreaming ? (
          <div className='flex flex-col items-center gap-2 text-red-600'>
            <CameraOff className='size-24' />
            <p className='flex text-center text-sm font-medium'>
              กล้องยังไม่เปิด กรุณากดปุ่มเริ่มตรวจสอบ <br /> เพื่อเริ่มใช้งาน
            </p>
          </div>
        ) : isWsLoading === true ? (
          <div className='m-4 flex size-fit items-center justify-center gap-2 rounded-md border p-4 text-muted-foreground'>
            <Loader2 className='size-6 animate-spin' />
            <span>กำลังรอข้อมูลจากเซิร์ฟเวอร์...</span>
          </div>
        ) : (
          <canvas
            ref={remoteCanvasRef}
            className='h-full w-full rounded-xl p-2'
          />
        )}

        <video
          ref={localVideoRef}
          className='hidden h-full w-full'
          autoPlay
          muted
          playsInline
        />
        <canvas ref={localCanvasRef} className='hidden' />
      </article>
    </section>
  );
};
