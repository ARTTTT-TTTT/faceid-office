'use client';

import dynamic from 'next/dynamic';

const VideoStream = dynamic(() => import('../components/VideoStream'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main className='p-8'>
      <VideoStream />
    </main>
  );
}
