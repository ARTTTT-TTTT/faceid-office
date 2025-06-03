import { ArrowLeft, Ban } from 'lucide-react';
import Link from 'next/link';

export default function SessionEnd() {
  return (
    <main className='container mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center space-y-3 bg-white px-6 py-6 text-center text-gray-800'>
      <section className='flex min-h-[60vh] flex-col items-center justify-center px-4 text-center'>
        <header className='mb-6'>
          <Ban className='h-20 w-20 text-red-500' />
        </header>

        <h1 className='mb-2 text-2xl font-bold text-red-600'>
          Session Ended or Not Configured
        </h1>
        <p className='max-w-md text-sm text-gray-600'>
          You are currently outside of the working session time, or no session
          has been configured yet.
        </p>

        <Link
          href='/setting'
          className='mt-8 flex items-center justify-center gap-1 text-blue-500'
        >
          <ArrowLeft className='size-6' />
          Go to Settings
        </Link>
      </section>
    </main>
  );
}
