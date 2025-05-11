'use client';

import { useState } from 'react';

import logger from '@/lib/logger';

import { AttendanceCard } from '@/components/detection/attendance_card';
import { CameraStream } from '@/components/detection/camera_stream';

import { fetchLatestUserLogs } from '@/app/api/detection/route';

import { UserLog } from '@/types/user-log';

export default function DetectionPage() {
  const [logUsers, setLogUsers] = useState<UserLog[]>([]);

  const handleUserDetected = async () => {
    try {
      const latestUsers = await fetchLatestUserLogs();
      setLogUsers(latestUsers);
    } catch (error) {
      logger(error, '[DetectionPage] handleUserDetected');
    }
  };

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
            key={user.id}
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

      <CameraStream onUserDetected={handleUserDetected} />
    </main>
  );
}
