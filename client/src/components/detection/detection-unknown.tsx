import Image from 'next/image';
import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { DetectionUnknownResponse } from '@/types/detection-log';

interface Props {
  detectionUnknownData: DetectionUnknownResponse[];
}

export const DetectionUnknown: React.FC<Props> = ({ detectionUnknownData }) => {
  return (
    <Card className='flex h-full flex-col items-center justify-center rounded-none border-red-500 bg-red-500'>
      <CardHeader className='p-2'>
        <CardTitle>บุคคลที่ไม่รู้จัก</CardTitle>
        <CardDescription className='sr-only'></CardDescription>
      </CardHeader>

      <CardContent className='flex size-full flex-col items-center justify-between gap-2 p-1'>
        {detectionUnknownData.slice(0, 2).map((item) => (
          <figure
            key={item.id}
            className='relative size-full overflow-hidden rounded-2xl border border-red-800 shadow-md'
          >
            <span className='absolute bottom-0 right-0 z-10 m-2 rounded bg-black/60 px-2 py-1 text-sm font-bold text-white'>
              {new Date(item.detectedAt).toLocaleString('th-TH')}
            </span>
            <Image
              src={`${process.env.NEXT_PUBLIC_SERVER_URL}${item.detectionImagePath}`}
              alt='Unknown person'
              fill
              className='rounded-xl object-fill'
            />
          </figure>
        ))}
      </CardContent>
    </Card>
  );
};
