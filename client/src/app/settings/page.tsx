'use client';
import { motion } from 'framer-motion';

import { CameraSettings } from '@/components/settings/camera-settings';
import { SessionSettings } from '@/components/settings/session-settings';

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.5,
    },
  },
};

export const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: (custom: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 700,
      damping: 30,
      delay: custom,
    },
  }),
};

export default function SettingsPage() {
  return (
    <main className='flex size-full flex-col items-center gap-6 rounded-b-xl bg-gray-100 px-4'>
      {/* Title */}
      <motion.h1
        // initial={{ y: -120 }}
        // animate={{ y: 0 }}
        // transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className='mt-3 text-4xl font-extrabold tracking-tight text-gray-800'
      >
        ตั้งค่าระบบ
      </motion.h1>

      {/* Stagger Container */}
      <motion.section
        // variants={containerVariants}
        // initial='hidden'
        // animate='visible'
        className='flex w-full flex-col items-center justify-center gap-6'
      >
        <motion.div
          // variants={itemVariants}
          // custom={0.2}
          className='flex w-full flex-col items-center justify-center'
        >
          <SessionSettings />
        </motion.div>
        <motion.div
          // variants={itemVariants}
          // custom={0.4}
          className='flex w-full flex-col items-center justify-center'
        >
          <CameraSettings />
        </motion.div>
      </motion.section>
    </main>
  );
}
