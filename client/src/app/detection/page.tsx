'use client';

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

export default function DetectionPage() {
  const [logUsers, setLogUsers] = useState<UserLog[]>([]);

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
    } catch (error) {
      logger(error, '[DetectionPage] handleUserDetected');
    }
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
      className={`grid grid-cols-5 gap-4 p-4 bg-gray-200 h-screen ${
        logUsers.length > 0 && 'grid-rows-[30%_70%] pb-8'
      }`}
    >
      {logUsers
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5)
        .map((user) => (
          <AttendanceCard
            key={user._id}
            name={user.name}
            image={user.image}
            timestamp={new Date(user.timestamp).toLocaleString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
            status={user.status}
          />
        ))}

      <CameraStream
        onUserDetected={handleUserDetected}
        admin_id={settingData._id}
        work_start_time={settingData.work_start_time}
      />
    </main>
  );
}
