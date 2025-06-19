import { AlarmClockOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import logger from '@/lib/logger';
import { cn } from '@/lib/utils';
import { useSessionCountdown } from '@/hooks/use-session-countdown';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { endSession, startSession } from '@/utils/api/session';
import { createWebSocket } from '@/utils/api/websocket';
import { formatTime } from '@/utils/format-time';

import { AdminSettings } from '@/types/admin';
import { Me } from '@/types/auth';
import { Session } from '@/types/session';
import { FaceTrackingResult } from '@/types/websocket';

interface Props {
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  localCanvasRef: React.RefObject<HTMLCanvasElement>;
  remoteCanvasRef: React.RefObject<HTMLCanvasElement>;
  setIsWsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCameraId: string | null;
  setSelectedCameraId: React.Dispatch<React.SetStateAction<string | null>>;
  sessionData: Session | null;
  sessionLoading: boolean;
  setSessionData: React.Dispatch<React.SetStateAction<Session | null>>;
  settingsData: AdminSettings | null;
  userData: Me | null;
  refetchDetectionPerson: () => void;
  refetchDetectionUnknown: () => void;
}
// TODO: เพิ่ม loading

export const CameraStreamControl: React.FC<Props> = ({
  isStreaming,
  setIsStreaming,
  localVideoRef,
  localCanvasRef,
  remoteCanvasRef,
  setIsWsLoading,
  selectedCameraId,
  setSelectedCameraId,
  sessionData,
  sessionLoading,
  setSessionData,
  settingsData,
  userData,
  refetchDetectionPerson,
  refetchDetectionUnknown,
}) => {
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const showErrorToast = (message: string) => {
    toast.error(message, {
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    });
  };

  // * ========== SESSION ===========
  const { remainingTTL, isSessionActive } = useSessionCountdown(
    sessionData,
    sessionLoading,
  );

  const handleStartSession = async () => {
    if (isSessionActive || !sessionData) {
      showErrorToast('ไม่อยู่ในช่วงปิดเซสชั่น หรือไม่พบข้อมูลของเซสชั่น');
      return;
    }

    if (!selectedCameraId) {
      showErrorToast(
        'ไม่ข้อมูลกล้องที่ลงทะเบียนในระบบ กรุณาเพิ่มข้อมูลกล้องในหน้าตั้งค่า',
      );
      return;
    }

    const startedSession = await startSession();
    setSessionData(startedSession);
  };

  const handleEndSession = async () => {
    if (!isSessionActive || !sessionData || !sessionData.sessionId) {
      showErrorToast('ไม่อยู่ในช่วงเปิดเซสชั่น หรือไม่พบข้อมูลของเซสชั่น');
      return;
    }

    await handleStopCamera();
    const endedSession = await endSession(sessionData.sessionId);
    setSessionData(endedSession);
  };

  // * ========== DEVICE ===========
  const listVideoDevices = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoInputs);
      if (videoInputs.length > 0) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (error) {
      logger(error, 'Failed to list video devices:');
    }
  }, []);

  useEffect(() => {
    listVideoDevices();
  }, [listVideoDevices]);

  useEffect(() => {
    if (!selectedDeviceId && devices.length > 0) {
      setSelectedDeviceId(devices[0].deviceId);
    }
    if (
      !selectedCameraId &&
      settingsData &&
      Array.isArray(settingsData.cameras) &&
      settingsData.cameras.length > 0
    ) {
      setSelectedCameraId(settingsData.cameras[0]?.id);
    }
  }, [
    devices,
    settingsData,
    selectedCameraId,
    selectedDeviceId,
    setSelectedCameraId,
  ]);

  // * ========== CAMERA ===========
  const handleStartCamera = async () => {
    if (isStreaming) {
      showErrorToast('กำลังสตรีมอยู่แล้ว');
      return;
    }

    if (!isSessionActive) {
      showErrorToast('กรุณาเริ่มเซสขั่น ก่อนเริ่มทำการตรวจสอบ');
      return;
    }

    if (!selectedDeviceId) {
      showErrorToast('ไม่พบอุปกรณ์กล้อง กรุณาเลือกอุปกรณ์กล้องที่ใช้');
      return;
    }

    if (!selectedCameraId) {
      showErrorToast(
        'ไม่มีข้อมูลกล้องที่ลงทะเบียนในระบบ กรุณาเพิ่มข้อมูลกล้องในหน้าตั้งค่า',
      );
      return;
    }

    if (!sessionData) {
      showErrorToast('ไม่พบข้อมูลเซสชัน กรุณาลองใหม่อีกครั้ง');
      return;
    }

    if (!remainingTTL || remainingTTL <= 0) {
      showErrorToast('เวลาเซสชันหมดอายุ กรุณาสร้างเซสชันใหม่');
      return;
    }

    if (!userData) {
      showErrorToast('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง');
      return;
    }

    handleStopCamera();

    setIsStreaming(true);
    setIsWsLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId } },
      });

      const video = localVideoRef.current;
      const canvas = localCanvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!video || !canvas || !ctx) {
        handleStopCamera();
        return;
      }

      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play().catch((err) => {
          logger(err, 'Failed to play video:');
          handleStopCamera();
        });
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const remoteCanvas = remoteCanvasRef.current;
        if (remoteCanvas) {
          remoteCanvas.width = video.videoWidth;
          remoteCanvas.height = video.videoHeight;
        }

        const ws = createWebSocket(
          userData.access_token,
          selectedCameraId,
          sessionData.sessionId,
          remainingTTL,
          (imageData: string) => {
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
          (_results: FaceTrackingResult) => {
            if (_results.status === 'SESSION_END') {
              handleEndSession();
            }
            if (_results.status === 'FOUND_PERSON') {
              refetchDetectionPerson();
              logger(_results);
            }
            if (_results.status === 'FOUND_UNKNOWN') {
              refetchDetectionUnknown();
              logger(_results);
            }
            if (_results.status === 'FOUND_PERSON_AND_UNKNOWN') {
              refetchDetectionPerson();
              refetchDetectionUnknown();
              logger(_results);
            }
            if (_results.status === 'ALREADY_LOGGED') {
              logger(_results);
              showErrorToast('Already logged');
            }
          },
        );
        wsRef.current = ws;

        const intervalId = captureAndSendFrames(video, canvas, ctx, ws);
        video.dataset.intervalId = intervalId.toString();
      };
      setIsWsLoading(false);
    } catch (error) {
      logger(error, 'Start camera error:');
      handleStopCamera();
    }
  };

  const handleStopCamera = useCallback(() => {
    setIsStreaming(false);

    const video = localVideoRef.current;
    if (video && video.srcObject) {
      (video.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      video.srcObject = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    wsRef.current = null; // ตั้งค่าเป็น null เสมอหลังจากพยายามปิด

    const intervalId = video?.dataset.intervalId;
    if (intervalId) {
      clearInterval(Number(intervalId));
      delete video.dataset.intervalId;
    }
    setIsWsLoading(false);
  }, [localVideoRef, setIsStreaming, setIsWsLoading]);

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
          0.5, // * ความชัดของภาพ
        );
      } else {
        clearInterval(Number(video.dataset.intervalId));
        delete video.dataset.intervalId;
      }
    }, 1000 / 3); // * 3 FPS
    return intervalId;
  };

  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, [handleStopCamera]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      handleStopCamera();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleStopCamera]);

  const exit = async () => {
    await handleStopCamera();
    router.push('/dashboard');
  };

  return (
    <article className='grid w-full grid-cols-3 gap-2 bg-white px-2 py-2'>
      <Button
        onClick={exit}
        className={cn(
          'flex items-center justify-center gap-2 bg-red-500 hover:bg-red-500',
        )}
      >
        <ArrowLeft className='size-6' />
        ออก
      </Button>
      {sessionLoading ? (
        <div className='flex h-9 w-full items-center justify-center rounded-md border px-4 py-2 text-muted-foreground'>
          <Loader2 className='animate-spin' />
        </div>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='flex h-9 w-full items-center justify-center rounded-md border px-4 py-2 font-medium shadow-sm'>
                {isSessionActive ? (
                  formatTime(remainingTTL)
                ) : (
                  <AlarmClockOff className='text-red-700' />
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {isSessionActive
                ? `เซสชั่นกำลังเปิดอยู่`
                : `ไม่มีเซสชั่นที่ใช้งานอยู่`}
              <br />
              {isSessionActive
                ? `เหลือเวลาอีก ${formatTime(
                    remainingTTL,
                  )} ชั่วโมง เซสชั่นจะถูกปิดลง`
                : `กด "เริ่มเซสชั่น" เพื่อเริ่มเซสชั่น`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <Button
        onClick={isSessionActive ? handleEndSession : handleStartSession}
        className={cn(
          isSessionActive
            ? 'bg-red-500 hover:bg-red-500'
            : 'bg-blue-500 hover:bg-blue-500',
        )}
      >
        {isSessionActive ? 'หยุดเซสชั่น' : 'เริ่มเซสชั่น'}
      </Button>

      <Popover>
        <PopoverTrigger asChild className='col-span-2'>
          <Button variant='outline'>
            {!selectedDeviceId
              ? 'เลือกกล้อง'
              : devices.find((d) => d.deviceId === selectedDeviceId)?.label ||
                'กล้องไม่รู้จัก'}
          </Button>
        </PopoverTrigger>

        <PopoverContent className='w-72 space-y-2 p-2'>
          <span className='text-xs font-semibold text-gray-500'>
            🎥 กล้องจากอุปกรณ์
          </span>
          {devices.map((device) => (
            <Label key={device.deviceId} className='flex items-center gap-2'>
              <Checkbox
                checked={selectedDeviceId === device.deviceId} // <-- เปรียบเทียบกับ deviceId
                onCheckedChange={() => setSelectedDeviceId(device.deviceId)} // <-- เก็บ deviceId
              />
              <span className='text-sm'>
                {device.label || `Device ID: ${device.deviceId.slice(-4)}`}{' '}
              </span>
            </Label>
          ))}

          <span className='pt-2 text-xs font-semibold text-gray-500'>
            📡 กล้องที่ลงทะเบียน
          </span>
          {settingsData?.cameras.map((camera) => (
            <label key={camera.id} className='flex items-center gap-2'>
              <Checkbox
                checked={selectedCameraId === camera.id}
                onCheckedChange={() => setSelectedCameraId(camera.id)}
              />
              <span className='text-sm'>
                {camera.name} ({camera.location})
              </span>
            </label>
          ))}
        </PopoverContent>
      </Popover>

      <Button
        onClick={isStreaming ? handleStopCamera : handleStartCamera}
        className={cn(
          isStreaming
            ? 'bg-red-500 hover:bg-red-500'
            : 'bg-green-500 hover:bg-green-500',
        )}
      >
        {isStreaming ? 'หยุดตรวจสอบ' : 'เริ่มตรวจสอบ'}
      </Button>
    </article>
  );
};
