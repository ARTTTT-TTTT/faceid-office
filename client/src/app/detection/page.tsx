'use client';

import type { Variants } from 'framer-motion';
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
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
      delay: 0.4,
    },
  },
};

const sectionVariantsLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: (custom = 0) => ({
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
  visible: (custom = 0) => ({
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
      delay: custom,
    },
  }),
};

export default function DetectionPage() {
  const [trackingResults, _setTrackingResults] = useState<FaceTrackingResult[]>(
    [],
  );
  const [trackingUnknownResults, _setTrackingUnknownResults] = useState<
    FaceTrackingResult[]
  >([]);

  return (
    <main className='grid h-screen w-screen grid-cols-[35%_25%_40%] grid-rows-1 overflow-hidden'>
      {/* Section 1 */}
      <motion.section
        variants={sectionVariantsLeft}
        initial='hidden'
        animate='visible'
        custom={0.2}
        className='grid grid-rows-[60%_40%]'
      >
        <CameraStream />
        <SignYourself />
      </motion.section>

      {/* Section 2 */}
      <motion.section
        variants={sectionVariantsTop}
        initial='hidden'
        animate='visible'
        className='grid grid-rows-[50%_50%]'
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
