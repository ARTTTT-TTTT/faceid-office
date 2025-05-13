import { ArrowLeft, Ban } from 'lucide-react';
import Link from 'next/link';

export default function SessionEnd() {
  return (
    <main className='min-h-screen bg-white text-gray-800 container mx-auto w-full max-w-md px-6 py-6 text-center flex flex-col space-y-3 items-center justify-center'>
      <section className='flex flex-col items-center justify-center min-h-[60vh] text-center px-4'>
        <header className='mb-6'>
          <Ban className='w-20 h-20 text-red-500' />
        </header>

        <h1 className='text-2xl font-bold text-red-600 mb-2'>
          Session Ended or Not Configured
        </h1>
        <p className='text-gray-600 text-sm max-w-md'>
          You are currently outside of the working session time, or no session
          has been configured yet.
        </p>

        <Link
          href='/setting'
          className='mt-8 text-blue-500 flex items-center justify-center gap-1'
        >
          <ArrowLeft className='size-6' />
          Go to Settings
        </Link>
      </section>
    </main>
  );
}
