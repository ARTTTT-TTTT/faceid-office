'use client';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CameraSettings } from '@/components/settings/camera-settings';
import { SessionSettings } from '@/components/settings/session-settings';

export default function SettingPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <main className='relative flex min-h-screen w-screen flex-col items-center gap-6 bg-gray-100 px-4 py-12'>
      {/* Title */}
      <motion.h1
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className='relative z-10 text-4xl font-extrabold tracking-tight text-gray-800'
      >
        ตั้งค่าระบบ
      </motion.h1>

      {/* Stagger Container */}
      <motion.section
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='flex w-full flex-col items-center justify-center gap-6'
      >
        <motion.div
          variants={itemVariants}
          className='flex w-full flex-col items-center justify-center'
        >
          <SessionSettings />
        </motion.div>
        <motion.div
          variants={itemVariants}
          className='flex w-full flex-col items-center justify-center'
        >
          <CameraSettings />
        </motion.div>
      </motion.section>

      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 1.2,
        }}
        className='absolute left-6 top-12 z-20'
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          animate={{
            x: [0, -10, 0],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className='rounded-full bg-blue-500 p-3 text-white shadow-lg'
          onClick={() => router.back()}
        >
          <ArrowLeft className='size-6' />
        </motion.button>
      </motion.div>
    </main>
  );
}
