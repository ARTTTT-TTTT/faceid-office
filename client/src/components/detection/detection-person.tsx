'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { FaceTrackingResult } from '@/types/websocket';

interface Props {
  trackingResults: FaceTrackingResult[];
}

export const DetectionPerson: React.FC<Props> = ({ trackingResults = [] }) => {
  const [animateId, setAnimateId] = useState<number | null>(null);

  useEffect(() => {
    if (trackingResults.length > 0) {
      setAnimateId(Number(trackingResults[0].person_id));
    }
  }, [trackingResults]);

  return (
    <section className='grid size-full grid-rows-4 gap-2 overflow-hidden border-green-500 bg-green-500 px-1 py-2'>
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
          ></motion.article>
        ))}
      </AnimatePresence>
    </section>
  );
};
