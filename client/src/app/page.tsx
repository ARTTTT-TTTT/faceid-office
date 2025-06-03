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
    <main className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-16 text-center'>
      <h1 className='text-4xl font-extrabold tracking-tight text-gray-800'>
        FaceID Office
      </h1>

      <span className='mt-2 text-lg text-gray-500'>
        ระบบตรวจสอบการเข้า-ออกงานของพนักงาน
      </span>

      <div className='flex items-center justify-center gap-4'>
        {redisStatusData && redisStatusData.status === RedisStatus.END && (
          <ArrowRight className='-ml-12 mt-8 size-8 animate-bounce text-blue-500' />
        )}
        <Link
          href='/setting'
          className='mt-8 inline-block rounded-lg bg-green-500 px-4 py-2 font-semibold text-white transition duration-200 hover:bg-green-600'
        >
          1. Setting Page
        </Link>
      </div>

      <div className='flex items-center justify-center gap-4'>
        {redisStatusData && redisStatusData.status === RedisStatus.START && (
          <ArrowRight className='-ml-8 mt-8 size-8 animate-bounce text-blue-500' />
        )}
        <Link
          href='/detection'
          className='mt-8 inline-block rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition duration-200 hover:bg-blue-600'
        >
          2. Detection Page
        </Link>
      </div>

      <Link
        href='/video-stream'
        className='mt-8 inline-block rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-white transition duration-200 hover:bg-yellow-600'
      >
        Video Stream
      </Link>

      <Link
        href='/video-stream-v1'
        className='mt-8 inline-block rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-white transition duration-200 hover:bg-yellow-600'
      >
        Video Stream V1
      </Link>

      <Link
        href='/video-stream-v2'
        className='mt-8 inline-block rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-white transition duration-200 hover:bg-yellow-600'
      >
        Video Stream V2
      </Link>

      <footer className='absolute bottom-4 text-base text-gray-500'>
        © {new Date().getFullYear()} by{' '}
        <a href='/' className='font-medium text-blue-500 hover:underline'>
          CHANOM
        </a>
      </footer>
    </main>
  );
}
