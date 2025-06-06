import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRef } from 'react';

import logger from '@/lib/logger';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface CapturedFaceImage {
  angle: string;
  faceImage: string | null;
}

const initialCapturedImages: CapturedFaceImage[] = [
  { angle: 'หน้าตรง', faceImage: null },
  { angle: 'หันหน้าไปทางซ้าย', faceImage: null },
  { angle: 'หันหน้าไปทางขวา', faceImage: null },
];

export const AddPersonDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [capturedImages, setCapturedImages] = useState<CapturedFaceImage[]>(
    initialCapturedImages,
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    // TODO: เรียกใช้ API SOMTHING
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      // ปิดกล้อง
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      } catch (error) {
        alert('ไม่สามารถเข้าถึงกล้องได้');
        logger(error);
      }
    }
  };

  const capturePhoto = (index: number) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/png');

    const updated = [...capturedImages];
    updated[index] = { ...updated[index], faceImage: dataURL };
    setCapturedImages(updated);
  };

  useEffect(() => {
    if (isCameraOn && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isCameraOn]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='h-fit max-h-screen w-full max-w-2xl overflow-auto'>
        <DialogHeader>
          <DialogTitle>เพิ่มสมาชิกใหม่</DialogTitle>
          <DialogDescription>
            กรอกรายละเอียดเพื่อเพิ่มสมาชิกใหม่ในระบบ
          </DialogDescription>
        </DialogHeader>
        <div className='grid w-full grid-cols-2 gap-2'>
          {/* PROFILE IMAGE PREVIEW */}
          <Card>
            <CardHeader>
              <CardTitle>รูปโปรไฟล์</CardTitle>
            </CardHeader>
            <CardDescription className='sr-only'></CardDescription>
            <CardContent className='space-y-2'>
              <AspectRatio
                ratio={1 / 1}
                className='shimmer-bg rounded-md bg-muted'
              >
                <Image
                  src={profileImagePreview || '/images/example-person.png'}
                  alt='profile'
                  fill
                  className='size-full rounded-md border-2 border-black object-fill shadow-md'
                />
              </AspectRatio>
            </CardContent>
          </Card>

          {/* PERSON INFORMAION */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลส่วนตัว</CardTitle>
            </CardHeader>
            <CardDescription className='sr-only'></CardDescription>
            <CardContent className='space-y-2'>
              <section className='space-y-2'>
                <Label>ชื่อ</Label>
              </section>
              <section className='space-y-2'>
                <Label>ตำแหน่ง</Label>
                {/* ตำแหน่งเป็น dropdown ให้เลือกว่าจะเป็นอะไร */}
              </section>
              <section className='space-y-2'>
                <Label>รูปโปรไฟล์</Label>
                <Input type='file' onChange={handleFileChange} />
              </section>
            </CardContent>
          </Card>

          {/* FACE IMAGES PREVIEW */}
          <ScrollArea className='col-span-2 w-full whitespace-nowrap rounded-md border pt-6'>
            <span className='pl-4 font-bold'>รูปหน้าสำหรับใช้แสกนใบหน้า</span>
            <div className='flex w-max space-x-4 p-2 pb-4 pt-6'>
              {capturedImages.map((image, index) => (
                <figure key={index} className='group relative shrink-0'>
                  {image.faceImage ? (
                    <>
                      <button
                        onClick={() => {
                          const newImages = [...capturedImages];
                          newImages[index] = {
                            ...newImages[index],
                            faceImage: null,
                          };
                          setCapturedImages(newImages);
                        }}
                        className='absolute right-1 top-1 z-10 hidden rounded-full bg-red-500 text-white group-hover:block'
                      >
                        <X className='size-full' />
                      </button>
                      <Image
                        src={image.faceImage}
                        alt={`Face image ${image.angle}`}
                        className='aspect-[1/1] h-[12rem] w-[12rem] border-2 border-black object-cover'
                        width={192}
                        height={192}
                      />
                    </>
                  ) : (
                    <div className='flex aspect-square h-[12rem] w-[12rem] items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-muted'>
                      <span className='text-sm text-gray-500'>
                        {image.angle}
                      </span>
                    </div>
                  )}
                  <figcaption className='pt-2 text-center text-xs font-semibold text-foreground'>
                    {image.angle}
                  </figcaption>
                </figure>
              ))}
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>

          {/* CAMERA */}
          <Card className='col-span-2'>
            <CardHeader>
              <CardTitle>ถ่ายภาพ</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button
                onClick={toggleCamera}
                className={cn(
                  'w-full',
                  isCameraOn
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600',
                )}
              >
                {isCameraOn ? 'ปิดกล้อง' : 'เปิดกล้อง'}
              </Button>

              {isCameraOn && (
                <>
                  <div className='relative aspect-video overflow-hidden rounded-md border'>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className='h-full w-full object-cover'
                    />
                    <canvas ref={canvasRef} className='hidden' />
                  </div>

                  <div className='grid grid-cols-3 gap-2'>
                    {capturedImages.map((img, index) => (
                      <Button
                        key={index}
                        onClick={() => capturePhoto(index)}
                        disabled={!!img.faceImage}
                        variant='secondary'
                        size='sm'
                      >
                        {img.faceImage ? 'ถ่ายแล้ว' : `ถ่าย ${img.angle}`}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            className='col-span-2 ml-auto w-fit bg-green-500 hover:bg-green-600'
          >
            ยืนยันข้อมูล
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
