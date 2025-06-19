'use client';

import Image from 'next/image';

import { DetectionPersonResponse } from '@/types/detection-log';
interface Props {
  detectionPersonData: DetectionPersonResponse[];
}

export const DetectionPerson: React.FC<Props> = ({ detectionPersonData }) => {
  return (
    <section className='grid size-full grid-rows-4 gap-2 overflow-hidden bg-gray-100 p-1'>
      {detectionPersonData.slice(0, 4).map((item) => (
        <article
          key={item.id}
          className='flex size-full items-center justify-between gap-3 overflow-hidden rounded-xl border bg-green-300 p-1.5 shadow-md'
        >
          <section className='flex h-full w-full flex-shrink-0 gap-2'>
            <figure className='relative flex h-full w-full flex-col items-center justify-center'>
              <Image
                src={`${process.env.NEXT_PUBLIC_SERVER_URL}${item.detectionImagePath}`}
                alt='Detection'
                fill
                className='rounded-lg object-fill ring-2 ring-blue-400'
              />
              <span className='sr-only absolute bottom-0 rounded bg-white bg-opacity-75 p-0.5 text-xs text-gray-500'>
                ตรวจจับได้
              </span>{' '}
            </figure>
            <figure className='relative flex h-full w-full flex-col items-center justify-center'>
              <Image
                src={`${process.env.NEXT_PUBLIC_SERVER_URL}${item.profileImagePath}`}
                alt='Profile'
                fill
                className='rounded-lg object-fill ring-2 ring-green-600'
              />
              <span className='sr-only absolute bottom-0 rounded bg-white bg-opacity-75 p-0.5 text-xs text-gray-500'>
                โปรไฟล์
              </span>{' '}
              <figcaption className='absolute bottom-0 flex h-fit w-full flex-col items-center justify-center rounded-lg border border-black bg-white'>
                <h3 className='text-lg font-semibold text-gray-800'>
                  {item.fullName}
                </h3>
                <p className='text-sm text-gray-600'>
                  ตำแหน่ง:{' '}
                  <span className='font-medium text-purple-700'>
                    {item.position}
                  </span>
                </p>
                <p className='text-xs text-gray-500'>
                  เวลา: {new Date(item.detectedAt).toLocaleString('th-TH')}
                </p>
              </figcaption>
            </figure>
          </section>
        </article>
      ))}
    </section>
  );
};
