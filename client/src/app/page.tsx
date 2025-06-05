import Link from 'next/link';
import '@/lib/env';

import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className='flex h-screen w-screen flex-col items-center justify-center gap-6'>
      <h1 className='text-4xl font-extrabold tracking-tight text-gray-800'>
        FaceID Office
      </h1>

      <span className='mt-2 text-lg text-gray-500'>
        ระบบตรวจสอบการเข้า-ออกงานของพนักงาน
      </span>

      <Button asChild className='bg-sky-500 hover:bg-sky-500'>
        <Link href='/login'>Login Page</Link>
      </Button>

      <Button asChild className='bg-blue-500 hover:bg-blue-500'>
        <Link href='/detection'>Detection Page</Link>
      </Button>

      <Button asChild className='bg-green-500 hover:bg-green-500'>
        <Link href='/setting'>Setting Page</Link>
      </Button>

      <Button asChild className='bg-yellow-500 hover:bg-yellow-500'>
        <Link href='/video-stream-v1'>Video Stream V1</Link>
      </Button>

      <Button asChild className='bg-yellow-500 hover:bg-yellow-500'>
        <Link href='/video-stream-v2'>Video Stream V2</Link>
      </Button>

      <footer className='absolute bottom-4 text-base text-gray-500'>
        © {new Date().getFullYear()} by{' '}
        <a href='/' className='font-medium text-blue-500 hover:underline'>
          CHANOM
        </a>
      </footer>
    </main>
  );
}
