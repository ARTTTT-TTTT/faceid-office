'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import logger from '@/lib/logger';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import log_users from '@/__mocks__/log_users.json';

export default function DetectionPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        logger(err, 'ไม่สามารถเข้าถึงกล้องได้:');
      });
  }, []);

  return (
    <main className='grid grid-cols-5 grid-rows-[30%_70%] gap-4 p-4 pb-8 bg-gray-200 h-screen'>
      {log_users.slice(0, 5).map((user) => (
        <Card key={user.id}>
          <CardContent className='p-4 flex flex-col items-center gap-4'>
            <CardHeader className='w-24 h-24 relative'>
              <Image
                src={user.image}
                alt='Profile'
                sizes='100%'
                fill
                className='rounded-full object-cover'
              />
            </CardHeader>
            <CardTitle className='font-medium text-xl'>{user.name}</CardTitle>
            <CardDescription>{user.time}</CardDescription>
            <CardFooter
              className={`${
                user.status === 'เข้างาน'
                  ? 'text-green-600 bg-green-100'
                  : user.status === 'สาย'
                  ? 'text-yellow-600 bg-yellow-100'
                  : 'bg-gray-100'
              } px-2 py-1 rounded-xl text-sm`}
            >
              {user.status}
            </CardFooter>
          </CardContent>
        </Card>
      ))}

      <Card className='col-span-5 h-full'>
        <CardContent className='p-4 h-full'>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className='w-full h-full object-cover rounded-xl'
          />
        </CardContent>
      </Card>
    </main>
  );
}
