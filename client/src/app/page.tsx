'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import '@/lib/env';

import { useFetch } from '@/hooks/useFetch';

import { fetchRedisStatus, fetchSetting } from '@/app/api/setting/route';

import {
  RedisStartStatus,
  RedisStatus,
  RedisStopStatus,
  Setting,
} from '@/types/setting';

// !FIX ไม่มีข้อมูลตั้งค่า ลูกศรควรจะแสดง แต่ลูกศรไม่แสดง

export default function HomePage() {
  const { data: settingData, loading: loadingSetting } =
    useFetch<Setting | null>(fetchSetting);

  const fetchRedis = useCallback(() => {
    if (!settingData) return Promise.resolve(null);
    return fetchRedisStatus(settingData._id);
  }, [settingData]);

  const { data: redisStatusData, loading: loadingRedisStatus } = useFetch<
    RedisStartStatus | RedisStopStatus | null
  >(fetchRedis);

  if (loadingRedisStatus || loadingSetting) return;
  return (
    <main className='bg-gradient-to-br from-blue-50 to-white flex min-h-screen flex-col items-center justify-center py-16 px-4 text-center'>
      <h1 className='text-4xl font-extrabold text-gray-800 tracking-tight'>
        FaceID Office
      </h1>

      <span className='mt-2 text-gray-500 text-lg'>
        ระบบตรวจสอบการเข้า-ออกงานของพนักงาน
      </span>

      <div className='flex items-center justify-center gap-4'>
        {redisStatusData && redisStatusData.status === RedisStatus.END && (
          <ArrowRight className='mt-8 size-8 animate-bounce text-blue-500 -ml-12' />
        )}
        <Link
          href='/setting'
          className='mt-8 inline-block rounded-lg bg-green-500 px-4 py-2 text-white font-semibold hover:bg-green-600 transition duration-200'
        >
          1. Setting Page
        </Link>
      </div>

      <div className='flex items-center justify-center gap-4'>
        {redisStatusData && redisStatusData.status === RedisStatus.START && (
          <ArrowRight className='mt-8 size-8 animate-bounce text-blue-500 -ml-8' />
        )}
        <Link
          href='/detection'
          className='mt-8 inline-block rounded-lg bg-blue-500 px-4 py-2 text-white font-semibold hover:bg-blue-600 transition duration-200'
        >
          2. Detection Page
        </Link>
      </div>

      <Link
        href='/video-stream-v1'
        className='mt-8 inline-block rounded-lg bg-yellow-500 px-4 py-2 text-white font-semibold hover:bg-yellow-600 transition duration-200'
      >
        Video Stream V1
      </Link>

      <Link
        href='/video-stream-v2'
        className='mt-8 inline-block rounded-lg bg-yellow-500 px-4 py-2 text-white font-semibold hover:bg-yellow-600 transition duration-200'
      >
        Video Stream V2
      </Link>

      <footer className='absolute bottom-4 text-base text-gray-500'>
        © {new Date().getFullYear()} by{' '}
        <a href='/' className='text-blue-500 hover:underline font-medium'>
          CHANOM
        </a>
      </footer>
    </main>
  );
}
