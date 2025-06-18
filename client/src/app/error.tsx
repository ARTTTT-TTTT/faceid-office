'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className='flex min-h-screen flex-col items-center justify-center text-center'>
      <h1 className='mt-8 text-4xl md:text-6xl'>Oops, something went wrong!</h1>
      <Button onClick={reset} className='mt-4'>
        Try again
      </Button>
    </main>
  );
}
