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

      <footer className='absolute bottom-4 text-base text-gray-500'>
        © {new Date().getFullYear()} by{' '}
        <a href='/' className='text-blue-500 hover:underline font-medium'>
          CHANOM
        </a>
      </footer>
    </main>
  );
}
