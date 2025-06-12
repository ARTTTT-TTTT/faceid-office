'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

import { FaceTrackingResult } from '@/types/detection';

interface Props {
  trackingResults: FaceTrackingResult[];
}

export const DetectionPerson: React.FC<Props> = ({ trackingResults = [] }) => {
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
  }, [personDetections, trackingResults]);

  return (
    <section className='grid size-full grid-rows-4 gap-2 overflow-hidden bg-green-500 px-1 py-2'>
      <AnimatePresence mode='sync'>
        {trackingResults.slice(0, 4).map((item, index) => (
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
              delay: Number(item.person_id) === animateId ? 0 : 0.05 * index,
            }}
            layout
            className='flex size-full items-center justify-between gap-1 overflow-hidden rounded-xl bg-yellow-500 shadow-md'
          >
            {/* คอนเทนต์เดิม */}
          </motion.article>
        ))}
      </AnimatePresence>
    </section>
  );
};
