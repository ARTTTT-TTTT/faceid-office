import Link from 'next/link';
import '@/lib/env';

export default function HomePage() {
  return (
    <main className='bg-gradient-to-br from-blue-50 to-white flex min-h-screen flex-col items-center justify-center py-16 px-4 text-center'>
      <h1 className='text-4xl font-extrabold text-gray-800 tracking-tight'>
        FaceID Office
      </h1>

      <span className='mt-2 text-gray-500 text-lg'>
        ระบบตรวจสอบการเข้า-ออกงานของพนักงาน
      </span>

      <Link
        href='/detection'
        className='mt-8 inline-block rounded-lg bg-blue-500 px-4 py-2 text-white font-semibold hover:bg-blue-600 transition duration-200'
      >
        Detection Page
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
