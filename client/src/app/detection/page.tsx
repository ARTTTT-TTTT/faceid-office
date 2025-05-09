import { AttendanceCard } from '@/components/detection/attendance_card';
import { CameraStream } from '@/components/detection/camera_stream';

import log_users from '@/__mocks__/log_users.json';

export default function DetectionPage() {
  return (
    <main className='grid grid-cols-5 grid-rows-[30%_70%] gap-4 p-4 pb-8 bg-gray-200 h-screen'>
      {log_users.slice(0, 5).map((user) => (
        <AttendanceCard
          key={user.id}
          name={user.name}
          image={user.image}
          time={user.time}
          status={user.status}
        />
      ))}

      <CameraStream />
    </main>
  );
}
