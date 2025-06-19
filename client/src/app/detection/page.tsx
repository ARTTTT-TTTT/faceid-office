'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';

import { useFetch } from '@/hooks/use-fetch';

import { CameraStream } from '@/components/detection/camera-stream';
import { DetectionPerson } from '@/components/detection/detection-person';
import { DetectionTable } from '@/components/detection/detection-table';
import { DetectionUnknown } from '@/components/detection/detection-unknown';
import { SignYourself } from '@/components/detection/sign-yourself';

import { getSettings } from '@/utils/api/admin';
import { me } from '@/utils/api/auth';
import { getLatestDetectionLogs } from '@/utils/api/detection-log';
import { getSessionStatus } from '@/utils/api/session';

import { AdminSettings } from '@/types/admin';
import { Me } from '@/types/auth';
import {
  DetectionPersonResponse,
  DetectionUnknownResponse,
} from '@/types/detection-log';
import { Session } from '@/types/session';

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

// TODO: เพิ่ม loading

export default function DetectionPage() {
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const { data: userData } = useFetch<Me>(me);
  const {
    data: sessionData,
    setData: setSessionData,
    loading: sessionLoading,
  } = useFetch<Session>(getSessionStatus);
  const { data: settingsData } = useFetch<AdminSettings>(getSettings);

  const fetchUnknownLogs = useCallback(async () => {
    if (!sessionData || !selectedCameraId) return [];
    return (await getLatestDetectionLogs({
      isUnknown: true,
      limit: 2,
      sessionId: sessionData.sessionId,
      cameraId: selectedCameraId,
    })) as DetectionUnknownResponse[];
  }, [sessionData, selectedCameraId]);

  const { data: detectionUnknownData, refetch: refetchDetectionUnknown } =
    useFetch<DetectionUnknownResponse[]>(fetchUnknownLogs);

  const fetchPersonLogs = useCallback(async () => {
    if (!sessionData || !selectedCameraId) return [];
    return (await getLatestDetectionLogs({
      isUnknown: false,
      limit: 4,
      sessionId: sessionData.sessionId,
      cameraId: selectedCameraId,
    })) as DetectionPersonResponse[];
  }, [sessionData, selectedCameraId]);

  const { data: detectionPersonData, refetch: refetchDetectionPerson } =
    useFetch<DetectionPersonResponse[]>(fetchPersonLogs);

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
        <CameraStream
          selectedCameraId={selectedCameraId}
          setSelectedCameraId={setSelectedCameraId}
          sessionData={sessionData}
          sessionLoading={sessionLoading}
          setSessionData={setSessionData}
          settingsData={settingsData}
          userData={userData}
          refetchDetectionPerson={refetchDetectionPerson}
          refetchDetectionUnknown={refetchDetectionUnknown}
        />
        <SignYourself />
      </motion.section>

      {/* Section 2 */}
      <motion.section
        variants={sectionVariantsTop}
        initial='hidden'
        animate='visible'
        className='grid grid-rows-[50%_50%]'
      >
        <DetectionUnknown detectionUnknownData={detectionUnknownData ?? []} />
        <DetectionTable />
      </motion.section>

      {/* Section 3 */}
      <motion.section
        variants={sectionVariantsRight}
        initial='hidden'
        animate='visible'
        custom={0.6}
      >
        <DetectionPerson detectionPersonData={detectionPersonData ?? []} />
      </motion.section>
    </main>
  );
}
