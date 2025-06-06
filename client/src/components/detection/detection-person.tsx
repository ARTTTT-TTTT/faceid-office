'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

import { FaceTrackingResult } from '@/types/detection';

interface Props {
  trackingResults: FaceTrackingResult[];
}

export const DetectionPerson: React.FC<Props> = ({ trackingResults }) => {
  const [animateId, setAnimateId] = useState<number | null>(null);

  const personDetections = useMemo(
    () => [
      { id: 1, name: 'อาท', imageUrl: '/images/og.jpg', time: '00:01' },
      { id: 2, name: 'พี', imageUrl: '/images/og.jpg', time: '00:02' },
      { id: 3, name: 'ปัน', imageUrl: '/images/og.jpg', time: '00:02' },
      { id: 4, name: 'ปัน', imageUrl: '/images/og.jpg', time: '00:02' },
    ],
    [],
  );

  useEffect(() => {
    if (trackingResults.length > 0) {
      setAnimateId(Number(trackingResults[0].person_id));
    }
  }, [personDetections]);

  return (
    <section className='grid size-full grid-rows-4 gap-2 overflow-hidden bg-green-500 px-1 py-2'>
      <AnimatePresence mode='sync'>
        {trackingResults.map((item, index) => (
          <motion.article
            key={item.person_id}
            custom={Number(item.person_id) === animateId}
            initial={{
              x: 100,
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              x: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              x: -100,
              opacity: 0,
              scale: 0.8,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: Number(item.person_id) === animateId ? 0 : 0.05 * index, // แค่ item แรกเท่านั้นที่ delay=0
            }}
            layout
            className='flex size-full items-center justify-between gap-1 overflow-hidden rounded-xl bg-yellow-500 shadow-md'
          >
            <section className='relative aspect-video h-full w-1/2'>
              <Image
                src={`data:image/png;base64,${item.detection_image}`}
                alt='Person Left'
                fill
                className='rounded-xl object-fill'
              />
            </section>
            <section className='flex h-full w-1/2 flex-col items-center justify-center'>
              <div className='relative aspect-video h-[70%] w-full'>
                <Image
                  src={`data:image/png;base64,${item.detection_image}`}
                  alt='Person profile'
                  fill
                  className='rounded-xl object-fill'
                />
              </div>
              <div className='flex h-[30%] w-full flex-col items-center justify-between'>
                <span className='flex size-full items-center justify-center overflow-hidden text-nowrap font-bold'>
                  {item.person_id}
                </span>
                <span className='flex size-full items-center justify-center'>
                  {item.person_id}
                </span>
              </div>
            </section>
          </motion.article>
        ))}
      </AnimatePresence>
    </section>
  );
};
