import { CameraOff, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import logger from '@/lib/logger';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { createWebSocket } from '@/app/api/detection/route';
import { checkboxToggleSelection } from '@/utils/checkbox-toggle-selection';
import { formatElapsedTime } from '@/utils/format-elapsed-time';

interface FaceTrackingResult {
  id: string;
  name: string;
}

const camaraData = [
  { id: '1', name: 'reg-cam-001', position: 'หน้าร้าน' },
  { id: '2', name: 'reg-cam-002', position: 'โกดัง' },
];

export const CameraStream: React.FC = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const remoteCanvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [trackingResult, setTrackingResult] = useState<
    FaceTrackingResult[] | null
  >(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [selectedRegisteredIds, setSelectedRegisteredIds] = useState<string[]>(
    [],
  );
  const [isStreaming, setIsStreaming] = useState(false);

  const listVideoDevices = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoInputs);
      if (videoInputs.length > 0) {
        setSelectedDeviceIds([videoInputs[0].deviceId]);
      }
    } catch (error) {
      logger(error, 'Failed to list video devices:');
    }
  }, []);

  useEffect(() => {
    listVideoDevices();
  }, [listVideoDevices]);

  const captureAndSendFrames = (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    ws: WebSocket,
  ) => {
    const intervalId = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              blob.arrayBuffer().then((buffer) => ws.send(buffer));
            }
          },
          'image/jpeg',
          0.5,
        );
      }
    }, 1000 / 3);
    return intervalId;
  };

  const startCamera = async () => {
    if (selectedDeviceIds.length === 0 || isStreaming) return;

    setIsStreaming(true);
    setElapsedTime(0);
    timerRef.current = setInterval(
      () => setElapsedTime((prev) => prev + 1),
      1000,
    );

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceIds } },
      });

      const video = localVideoRef.current;
      const canvas = localCanvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!video || !canvas || !ctx) return;

      video.srcObject = stream;

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const remoteCanvas = remoteCanvasRef.current;
        if (remoteCanvas) {
          remoteCanvas.width = video.videoWidth;
          remoteCanvas.height = video.videoHeight;
        }

        const ws = createWebSocket(
          (data: unknown) =>
            setTrackingResult(data as FaceTrackingResult[] | null),
          remoteCanvasRef,
        );
        wsRef.current = ws;

        const intervalId = captureAndSendFrames(video, canvas, ctx, ws);
        video.dataset.intervalId = intervalId.toString();
      };
    } catch (error) {
      logger(error, 'Camera error:');
      stopCamera();
    }
  };

  const stopCamera = () => {
    setIsStreaming(false);
    setElapsedTime(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const video = localVideoRef.current;
    if (video && video.srcObject) {
      (video.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      video.srcObject = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const intervalId = video?.dataset.intervalId;
    if (intervalId) {
      clearInterval(Number(intervalId));
      delete video.dataset.intervalId;
    }

    setTrackingResult(null);
  };

  return (
    <section className='flex size-full flex-col items-center justify-center gap-2 rounded-lg border bg-white shadow-sm'>
      {/* CAMERA STREAM CONTROL */}
      <article className='flex h-fit w-full items-center justify-between px-2 pt-2'>
        <span className='h-9 rounded-md border bg-white px-4 py-2 text-sm font-medium'>
          {formatElapsedTime(elapsedTime)}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline'>
              {selectedDeviceIds.length === 0
                ? 'เลือกกล้อง'
                : 'กล้อง ' + selectedDeviceIds[0].slice(-4)}
            </Button>
          </PopoverTrigger>

          <PopoverContent className='w-72 space-y-2 p-2'>
            <span className='text-xs font-semibold text-gray-500'>
              🎥 กล้องจากอุปกรณ์
            </span>
            {devices.map((device) => (
              <Label key={device.deviceId} className='flex items-center gap-2'>
                <Checkbox
                  checked={selectedDeviceIds.includes(device.deviceId)}
                  onCheckedChange={() =>
                    checkboxToggleSelection(
                      device.deviceId,
                      selectedDeviceIds,
                      setSelectedDeviceIds,
                    )
                  }
                />
                <span className='text-sm'>
                  {device.label || `${device.deviceId.slice(-4)}`}
                </span>
              </Label>
            ))}

            <span className='pt-2 text-xs font-semibold text-gray-500'>
              📡 กล้องที่ลงทะเบียน
            </span>
            {camaraData.map((cam) => (
              <label key={cam.id} className='flex items-center gap-2'>
                <Checkbox
                  checked={selectedRegisteredIds.includes(cam.id)}
                  onCheckedChange={() =>
                    checkboxToggleSelection(
                      cam.id,
                      selectedRegisteredIds,
                      setSelectedRegisteredIds,
                    )
                  }
                />
                <span className='text-sm'>{cam.name}</span>
              </label>
            ))}
          </PopoverContent>
        </Popover>

        <Button
          onClick={isStreaming ? stopCamera : startCamera}
          className={
            isStreaming
              ? 'bg-red-500 hover:bg-red-500'
              : 'bg-green-500 hover:bg-green-500'
          }
        >
          {isStreaming ? 'หยุดตรวจสอบ' : 'เริ่มตรวจสอบ'}
        </Button>
      </article>

      {/* DETECTED PERSON CAMERA STREAM */}
      <article className='flex size-full flex-col items-center justify-center gap-2'>
        {!isStreaming ? (
          <div className='flex flex-col items-center gap-2 text-red-600'>
            <CameraOff className='size-24' />
            <p className='flex text-center text-sm font-medium'>
              กล้องยังไม่เปิด กรุณากดปุ่มเริ่มตรวจสอบ <br /> เพื่อเริ่มใช้งาน
            </p>
          </div>
        ) : trackingResult === null ? (
          // กรณี streaming แล้วแต่ยังไม่ได้ข้อมูล
          <div className='flex size-fit items-center justify-center gap-2 rounded-md border p-4'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='text-muted-foreground'>
              กำลังรอข้อมูลจากเซิร์ฟเวอร์...
            </span>
          </div>
        ) : (
          <pre className='whitespace-pre-wrap text-sm text-gray-800'>
            {JSON.stringify(trackingResult, null, 2)}
          </pre>
        )}

        <video
          ref={localVideoRef}
          className='hidden'
          autoPlay
          muted
          playsInline
        />
        <canvas ref={localCanvasRef} className='hidden' />
        <canvas ref={remoteCanvasRef} className='hidden' />
      </article>
    </section>
  );
};
