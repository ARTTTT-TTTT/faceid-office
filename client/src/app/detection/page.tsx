'use client';

import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';

import logger from '@/lib/logger';
import { useFetch } from '@/hooks/useFetch';

import { AttendanceCard } from '@/components/detection/attendance_card';
import { CameraStream } from '@/components/detection/camera_stream';
import SessionEnd from '@/components/detection/session_end';

import { fetchLatestUserLogs } from '@/app/api/detection/route';
import { fetchRedisStatus, fetchSetting } from '@/app/api/setting/route';

import {
  RedisStartStatus,
  RedisStatus,
  RedisStopStatus,
  Setting,
} from '@/types/setting';
import { UserLog } from '@/types/user-log';

// !FIX แสดงผลเวลาผิด

export default function DetectionPage() {
  const [logUsers, setLogUsers] = useState<UserLog[]>([]);
  const [animationKey, setAnimationKey] = useState<number>(0);

  const { data: settingData, loading: loadingSetting } =
    useFetch<Setting | null>(fetchSetting);

  const fetchRedis = useCallback(() => {
    if (!settingData) return Promise.resolve(null);
    return fetchRedisStatus(settingData._id);
  }, [settingData]);

  const { data: redisStatusData, loading: loadingRedisStatus } = useFetch<
    RedisStartStatus | RedisStopStatus | null
  >(fetchRedis);

  const handleUserDetected = async () => {
    try {
      const latestUsers = await fetchLatestUserLogs();
      setLogUsers(latestUsers);
      setAnimationKey((prev) => prev + 1);
    } catch (error) {
      logger(error, '[DetectionPage] handleUserDetected');
    }
  };

  const formatBangkokTime = (utcString: string): string => {
    const date = new Date(utcString);
    if (isNaN(date.getTime())) return 'Incorrect time';

    const bangkokTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const hours = String(bangkokTime.getHours()).padStart(2, '0');
    const minutes = String(bangkokTime.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  };

  if (loadingRedisStatus || loadingSetting) return;

  if (
    !settingData ||
    !redisStatusData ||
    redisStatusData.status === RedisStatus.END
  )
    return <SessionEnd />;

  return (
    <main
      className={`grid grid-cols-5 gap-4 p-4 h-screen bg-gray-200 ${
        logUsers.length > 0 && 'grid-rows-[30%_70%] pb-8'
      }`}
      dir='rtl'
    >
      {logUsers
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5)
        .map((user, index) => {
          const card = (
            <AttendanceCard
              key={user._id}
              name={user.name}
              image={user.image}
              timestamp={formatBangkokTime(user.timestamp)}
              status={user.status}
            />
          );

          return index === 0 ? (
            <motion.div
              key={animationKey}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 12,
              }}
            >
              {card}
            </motion.div>
          ) : (
            <div key={user._id}>{card}</div>
          );
        })}

      <CameraStream
        onUserDetected={handleUserDetected}
        admin_id={settingData._id}
        work_start_time={settingData.work_start_time}
      />
    </main>
  );
}
