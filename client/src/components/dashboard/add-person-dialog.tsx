import { AlertCircle, Camera, CameraOff, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { toast } from 'sonner';

import logger from '@/lib/logger';
import { cn } from '@/lib/utils';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { createPerson } from '@/utils/api/person';

import { CreatePersonPayload, Person, Position } from '@/types/person';

// TODO: handdle error .png

interface Props {
  isOpen: boolean;
  onClose: () => void;
  setPeopleData: React.Dispatch<React.SetStateAction<Person[] | null>>;
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

const positionOptions = Object.keys(Position).filter((key) =>
  isNaN(Number(key)),
);

export const AddPersonDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  setPeopleData,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImages, setCapturedImages] = useState<CapturedFaceImage[]>(
    initialCapturedImages,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImagePreview(URL.createObjectURL(file));
      setProfileFile(file);
    }
  };

  const cameraOff = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setIsCameraOn(false);
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      cameraOff();
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

  const clearFormState = () => {
    setFullName('');
    setPosition('');
    setProfileFile(null);
    setProfileImagePreview('');
    setCapturedImages(initialCapturedImages);
  };

  const handleSubmit = async () => {
    // TODO: ตั้งชื่อตัวพิมพ์เล็ก แล้วเว้นวรรคมีปัญหา ต้องมีตัวพิมพ์ใหญ่
    if (!fullName.trim()) {
      toast.error('กรุณากรอกชื่อ', {
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      return;
    }

    if (!position) {
      toast.error('กรุณาเลือกตำแหน่ง', {
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      return;
    }

    if (capturedImages.some((img) => !img.faceImage)) {
      toast.error('กรุณาถ่ายรูปหน้าสำหรับแสกนใบหน้าให้ครบ 3 มุม', {
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      return;
    }

    const faceImagesBlob = capturedImages
      .filter((img) => img.faceImage)
      .map((img) => {
        if (!img.faceImage) {
          throw new Error('faceImage is null');
        }
        const byteString = atob(img.faceImage.split(',')[1]);
        const mimeString = img.faceImage
          .split(',')[0]
          .split(':')[1]
          .split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new File([ab], `${img.angle}.png`, { type: mimeString });
      });

    const profileImageFile = profileFile ?? faceImagesBlob[0];

    if (!profileImageFile) {
      toast.error('ไม่สามารถกำหนดรูปโปรไฟล์ได้', {
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      return;
    }
    const createPersonPayload: CreatePersonPayload = {
      fullName,
      position,
      profileImage: profileImageFile,
      faceImages: faceImagesBlob,
    };
    try {
      const data = await createPerson(createPersonPayload);

      toast.success('เพิ่มสมาชิกใหม่สำเร็จ', {
        position: 'top-right',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      });

      setPeopleData((prev) => (prev ? [...prev, data] : [data]));

      clearFormState();
      //cameraOff();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string' &&
        (error as { message: string }).message === 'Unique constraint failed'
      ) {
        toast.error('ชื่อซ้ำในระบบ', {
          position: 'top-right',
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
      } else {
        toast.error('เกิดข้อผิดพลาดในการเพิ่มสมาชิก', {
          position: 'top-right',
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
      }
    }
  };

  useEffect(() => {
    if (isCameraOn && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isCameraOn]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        onClose();
        clearFormState();
        cameraOff();
      }}
    >
      <DialogContent className='h-fit max-h-screen w-full max-w-screen-lg overflow-auto'>
        <DialogHeader>
          <DialogTitle className='text-green-500'>เพิ่มสมาชิกใหม่</DialogTitle>
          <DialogDescription>
            กรอกรายละเอียดเพื่อเพิ่มสมาชิกใหม่ในระบบ
          </DialogDescription>
        </DialogHeader>
        <div className='grid-cols-auto grid w-full gap-2'>
          {/* PROFILE IMAGE PREVIEW */}
          <Card>
            <CardHeader>
              <CardTitle>รูปโปรไฟล์</CardTitle>
              <CardDescription className='sr-only'></CardDescription>
            </CardHeader>
            <CardContent>
              {' '}
              <AspectRatio
                ratio={1 / 1}
                className='shimmer-bg rounded-md bg-muted'
              >
                <Image
                  src={profileImagePreview || '/images/example-person.png'}
                  alt='profile'
                  fill
                  className='size-full rounded-md border-2 border-black object-contain shadow-md'
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
            <CardContent className='space-y-2 pb-0'>
              <section className='space-y-2'>
                <Label htmlFor='fullName'>ชื่อ-นามสกุล</Label>
                <Input
                  type='text'
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value.replace(/[^ก-๙a-zA-Z\s]/g, ''))
                  }
                  onBlur={() => {
                    const prefixesToRemove = [
                      'นาย',
                      'นาง',
                      'นางสาว',
                      'เด็กชาย',
                      'เด็กหญิง',
                      'ดช',
                      'ดญ',
                      'Mr',
                      'Mrs',
                      'Ms',
                      'Miss',
                    ];
                    let cleaned = fullName.replace(/\s+/g, ' ').trim();

                    const words = cleaned.split(' ');

                    if (
                      words.length >= 3 &&
                      prefixesToRemove.includes(words[0])
                    ) {
                      words.shift();
                      cleaned = words.join(' ');
                    }

                    setFullName(cleaned);
                  }}
                  placeholder='สมชาย แสนดี'
                />
              </section>
              <section className='space-y-2'>
                <Label>ตำแหน่ง</Label>
                <Select
                  value={position}
                  onValueChange={(val) => setPosition(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='เลือกตำแหน่ง' />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>
              <section>
                <Label>รูปโปรไฟล์</Label>
                <Input
                  type='file'
                  className='mt-2'
                  onChange={handleFileChange}
                />
                <CardDescription
                  className={cn(
                    profileImagePreview
                      ? 'sr-only'
                      : 'ml-auto mt-6 flex max-w-sm items-start justify-end gap-2 text-sm text-red-500',
                  )}
                >
                  <AlertCircle className='text-red-500' />
                  หมายเหตุ: หากไม่เลือกรูปโปรไฟล์
                  <br />
                  ระบบจะใช้รูปที่ถ่ายจากกล้องเป็นรูปโปรไฟล์
                </CardDescription>
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
                        className='aspect-[1/1] h-[19rem] w-[19rem] border-2 border-black object-cover'
                        width={300}
                        height={300}
                      />
                    </>
                  ) : (
                    <div className='flex aspect-square h-[19rem] w-[19rem] items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-muted'>
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
              <CardTitle className='flex items-center justify-between'>
                ถ่ายภาพ{' '}
                <Button
                  onClick={toggleCamera}
                  className={cn(
                    'w-fit',
                    isCameraOn
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600',
                  )}
                >
                  {isCameraOn ? (
                    <>
                      <CameraOff />
                      ปิดกล้อง
                    </>
                  ) : (
                    <>
                      <Camera />
                      เปิดกล้อง
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 py-0'>
              {isCameraOn && (
                <>
                  <div className='relative mx-auto aspect-square max-w-xl overflow-hidden rounded-md border'>
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
                        className='mb-4'
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
