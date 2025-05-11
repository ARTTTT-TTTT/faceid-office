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
    <main className='grid grid-cols-5 grid-rows-[30%_70%] gap-4 p-4 pb-8 bg-gray-200 h-screen'>
      {logUsers.slice(0, 5).map((user) => (
        <AttendanceCard
          key={user.index}
          name={user.name}
          image={user.image}
          timestamp={user.timestamp}
          status={user.status}
        />
      ))}

      <CameraStream onUserDetected={handleUserDetected} />
    </main>
  );
}
