'use client';
import { motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';

import { useFetch } from '@/hooks/use-fetch';

import { CameraSettings } from '@/components/settings/camera-settings';
import { SessionSettings } from '@/components/settings/session-settings';

import { getSettings } from '@/utils/api/admin';

import { AdminSettings } from '@/types/admin';

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
      type: 'spring' as const,
      stiffness: 700,
      damping: 30,
      delay: custom,
    },
  }),
};

// TODO: ถ้าไม่มี settingsData ให้ return ว่าดึงข้อมูลไม่ได้

export default function SettingsPage() {
  const {
    data: settingsData,
    setData: setSettingsData,
    loading: settingsLoading,
  } = useFetch<AdminSettings>(getSettings);

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
      {settingsLoading ? (
        <div className='flex size-fit items-center justify-center gap-2 rounded-md border p-4 text-muted-foreground'>
          <Loader2 className='size-6 animate-spin' />
          <span>กำลังโหลดข้อมูลการตั้งค่า...</span>
        </div>
      ) : settingsData ? (
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
            <SessionSettings
              settingsData={settingsData}
              setSettingsData={setSettingsData}
            />
          </motion.div>
          <motion.div
            // variants={itemVariants}
            // custom={0.4}
            className='flex w-full flex-col items-center justify-center'
          >
            <CameraSettings
              settingsData={settingsData}
              setSettingsData={setSettingsData}
            />
          </motion.div>
        </motion.section>
      ) : (
        <div className='flex size-fit items-center justify-center gap-2 rounded-md border border-red-500 p-4 text-red-500'>
          <X className='size-6' />
          <span>ไม่พบข้อมูลการตั้งค่า โปรดติดต่อผู้พัฒนา...</span>
        </div>
      )}
    </main>
  );
}
