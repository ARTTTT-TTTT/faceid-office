import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center text-center'>
      <h1 className='mt-8 text-4xl md:text-6xl'>Page Not Found</h1>
      <Link href='/' className='mt-8'>
        Back to home
      </Link>
    </main>
  );
}
