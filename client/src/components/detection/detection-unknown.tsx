import Image from 'next/image';
import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { FaceTrackingResult } from '@/types/detection';

interface Props {
  trackingUnknownResults: FaceTrackingResult[];
}

export const DetectionUnknown: React.FC<Props> = ({ trackingUnknownResults = [] }) => {
  const unknownDetections = [
    { id: 1, imageUrl: '/images/og.jpg', time: '00:01' },
    { id: 2, imageUrl: '/images/og.jpg', time: '00:02' },
  ];
  return (
    <Card className='flex h-full flex-col items-center justify-center border-red-500 bg-red-500'>
      <CardHeader className='p-2'>
        <CardTitle>บุคคลที่ไม่รู้จัก</CardTitle>
        <CardDescription className='sr-only'></CardDescription>
      </CardHeader>

      <CardContent className='flex size-full flex-col items-center justify-between gap-2 p-1'>
        {trackingUnknownResults.map((item) => (
          <div
            key={item.person_id}
            className='relative size-full overflow-hidden rounded-2xl shadow-md'
          >
            <span className='absolute left-0 top-0 z-10 m-2 rounded bg-black/60 px-2 py-1 text-sm font-bold text-white'>
              {item.person_id}
            </span>
            <Image
              src={`data:image/png;base64,${item.detection_image}`}
              alt='Unknown person'
              fill
              className='rounded-xl object-fill'
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
