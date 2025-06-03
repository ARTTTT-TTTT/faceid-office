'use client';

import { CameraStream } from '@/components/detection/camera-stream-card';

export default function DetectionPage() {
  return (
    // TODO: เอา padding นอกสุดออก
    <main className='box-border grid h-screen w-screen grid-cols-[35%_25%_40%] grid-rows-1 gap-2 p-2 pr-6'>
      <section className='box-border grid grid-rows-[70%_30%] gap-2 border p-2 pb-4'>
        <CameraStream />
        <div className='flex items-center justify-center border bg-blue-100'>
          2
        </div>
      </section>
      <section className='box-border grid grid-rows-[50%_50%] gap-2 border p-2 pb-4'>
        <div className='flex items-center justify-center border bg-green-100'>
          3
        </div>
        <div className='flex items-center justify-center border bg-pink-100'>
          4
        </div>
      </section>

      <section className='flex items-center justify-center border bg-yellow-100 p-2'>
        5
      </section>
    </main>
  );
}

// export default function DetectionPage() {
//   const [logUsers, setLogUsers] = useState<UserLog[]>([]);
//   const [animationKey, setAnimationKey] = useState<number>(0);

//   const { data: settingData, loading: loadingSetting } =
//     useFetch<Setting | null>(fetchSetting);

//   const fetchRedis = useCallback(() => {
//     if (!settingData) return Promise.resolve(null);
//     return fetchRedisStatus(settingData._id);
//   }, [settingData]);

//   const { data: redisStatusData, loading: loadingRedisStatus } = useFetch<
//     RedisStartStatus | RedisStopStatus | null
//   >(fetchRedis);

//   const handleUserDetected = async () => {
//     try {
//       const latestUsers = await fetchLatestUserLogs();
//       setLogUsers(latestUsers);
//       setAnimationKey((prev) => prev + 1);
//     } catch (error) {
//       logger(error, '[DetectionPage] handleUserDetected');
//     }
//   };

//   if (loadingRedisStatus || loadingSetting) return <div> loading </div>;

//   if (
//     !settingData ||
//     !redisStatusData ||
//     redisStatusData.status === RedisStatus.END
//   )
//     return <SessionEnd />;

//   return (
//     <main
//       className={`grid h-screen grid-cols-5 gap-4 bg-gray-200 p-4 ${
//         logUsers.length > 0 && 'grid-rows-[30%_70%] pb-8'
//       }`}
//       dir='rtl'
//     >
//       {logUsers
//         .sort(
//           (a, b) =>
//             new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
//         )
//         .slice(0, 5)
//         .map((user, index) => {
//           const card = (
//             <AttendanceCard
//               key={user._id}
//               name={user.name}
//               image={user.image}
//               timestamp={formatTime(user.timestamp)}
//               status={user.status}
//             />
//           );

//           return index === 0 ? (
//             <motion.div
//               key={animationKey}
//               initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
//               animate={{ opacity: 1, scale: 1, rotate: 0 }}
//               transition={{
//                 type: 'spring',
//                 stiffness: 300,
//                 damping: 12,
//               }}
//             >
//               {card}
//             </motion.div>
//           ) : (
//             <div key={user._id}>{card}</div>
//           );
//         })}

//       <CameraStream
//         onUserDetected={handleUserDetected}
//         admin_id={settingData._id}
//         work_start_time={settingData.work_start_time}
//       />
//     </main>
//   );
// }
