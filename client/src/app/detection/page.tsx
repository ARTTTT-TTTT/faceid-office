'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import { CameraStream } from '@/components/detection/camera-stream';
import { DetectionPerson } from '@/components/detection/detection-person';
import { DetectionTable } from '@/components/detection/detection-table';
import { DetectionUnknown } from '@/components/detection/detection-unknown';
import { SignYourself } from '@/components/detection/sign-yourself';

import { FaceTrackingResult } from '@/types/detection';

const sectionVariantsTop = {
  hidden: { y: -100, opacity: 0 },
  visible: (custom: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      delay: custom,
    },
  }),
};

const sectionVariantsLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: (custom: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      delay: custom,
    },
  }),
};

const sectionVariantsRight = {
  hidden: { x: 100, opacity: 0 },
  visible: (delay: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      delay: delay,
    },
  }),
};

export default function DetectionPage() {
  const [trackingResults, setTrackingResults] = useState<FaceTrackingResult[]>(
    [],
  );
  const [trackingUnknownResults, setTrackingUnknownResults] = useState<
    FaceTrackingResult[]
  >([]);

  return (
    <main className='grid h-screen w-screen grid-cols-[35%_25%_40%] grid-rows-1 gap-2 overflow-hidden bg-slate-500 pr-4'>
      {/* Section 1 */}
      <motion.section
        variants={sectionVariantsLeft}
        initial='hidden'
        animate='visible'
        custom={0.2}
        className='grid grid-rows-[70%_30%] gap-2 pb-4 pl-2 pt-2'
      >
        <CameraStream
          setTrackingResults={setTrackingResults}
          setTrackingUnknownResults={setTrackingUnknownResults}
        />
        <SignYourself />
      </motion.section>

      {/* Section 2 */}
      <motion.section
        variants={sectionVariantsTop}
        initial='hidden'
        animate='visible'
        custom={0.4}
        className='grid grid-rows-[50%_50%] gap-2 pb-4 pt-2'
      >
        <DetectionUnknown trackingUnknownResults={trackingUnknownResults} />
        <DetectionTable trackingResults={trackingResults} />
      </motion.section>

      {/* Section 3 */}
      <motion.section
        variants={sectionVariantsRight}
        initial='hidden'
        animate='visible'
        custom={0.6}
      >
        <DetectionPerson trackingResults={trackingResults} />
      </motion.section>
    </main>
  );
}
