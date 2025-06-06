import { ArrowLeft, CameraOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import logger from '@/lib/logger';
import { cn } from '@/lib/utils';

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

import { FaceTrackingResult } from '@/types/detection';

const camaraData = [
  { id: '1', name: 'reg-cam-001', position: 'หน้าร้าน' },
  { id: '2', name: 'reg-cam-002', position: 'โกดัง' },
];

interface Props {
  setTrackingResults: (results: FaceTrackingResult[] | ((prev: FaceTrackingResult[]) => FaceTrackingResult[])) => void;
  setTrackingUnknownResults: (results: FaceTrackingResult[] | ((prev: FaceTrackingResult[]) => FaceTrackingResult[])) => void;
}

export const CameraStream: React.FC<Props> = ({
  setTrackingResults,
  setTrackingUnknownResults,
}) => {
  const router = useRouter();
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

  const addTrackingResult = useCallback((newResults: FaceTrackingResult[]) => {
    // แยกผลลัพธ์เป็น known และ unknown
    const unknownResults = newResults.filter(
      (result) => result.person_id === 'Unknown',
    );
    const knownResults = newResults.filter(
      (result) => result.person_id !== 'Unknown',
    );

    // ฟังก์ชันอัปเดต state โดยจำกัดแค่ 4 อันล่าสุด
    const updateState = (
      prevState: FaceTrackingResult[],
      newItems: FaceTrackingResult[],
    ): FaceTrackingResult[] => {
      const updated = [...prevState, ...newItems];

      // ลบของซ้ำ
      const seen = new Set<string>();
      const uniqueItems = updated.filter((item) => {
        const key = `${item.person_id}-${item.detection_image}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // เก็บแค่ 4 อันล่าสุด
      return uniqueItems.slice(-4);
    };

    // อัปเดต state ถ้ามีข้อมูลใหม่
    if (unknownResults.length > 0) {
      setTrackingUnknownResults((prev) => updateState(prev, unknownResults));
    }

    if (knownResults.length > 0) {
      setTrackingResults((prev) => updateState(prev, knownResults));
    }
  }, []);

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
          (imageData) => {
            const img = new Image();
            img.onload = () => {
              const remoteCtx = remoteCanvasRef.current?.getContext('2d');
              if (remoteCtx && remoteCanvasRef.current) {
                remoteCtx.drawImage(
                  img,
                  0,
                  0,
                  remoteCanvasRef.current.width,
                  remoteCanvasRef.current.height,
                );
              }
              URL.revokeObjectURL(img.src);
            };
            img.src = `data:image/jpeg;base64,${imageData}`;
          },
          (results) => {
            addTrackingResult(results);
          },
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

  const exit = () => {
    // TODO: ยกเลิกการเชื่อมต่อออกจาก session ยกเลิกทุกอย่าง
    router.push('/');
  };

  return (
    <section className='flex size-full flex-col items-center justify-center gap-2 rounded-lg border bg-white shadow-sm'>
      {/* CAMERA STREAM CONTROL */}
      <article className='flex h-fit w-full flex-wrap items-center justify-between gap-2 px-2 pt-2'>
        <Button
          onClick={exit}
          className={cn(
            'flex items-center justify-center gap-2 bg-red-500 hover:bg-red-500',
          )}
        >
          <ArrowLeft className='size-6' />
          ออก
        </Button>
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
          className={cn(
            isStreaming
              ? 'bg-red-500 hover:bg-red-500'
              : 'bg-green-500 hover:bg-green-500',
          )}
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
          className='mb-4 w-full rounded-xl shadow'
          autoPlay
          muted
          playsInline
        />
        <canvas ref={localCanvasRef} className='hidden' />
        <canvas
          ref={remoteCanvasRef}
          className='w-full rounded-xl border border-gray-300 bg-black shadow'
          style={{ aspectRatio: '16/9' }}
        />
      </article>
    </section>
  );
};
