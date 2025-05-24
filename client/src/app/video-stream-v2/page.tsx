'use client';

import { LiveKitRoom, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect, useState } from 'react';
import '@livekit/components-styles';

import { Card } from '@/components/ui/card';

export default function VideoStreamV2() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const join = async () => {
      const res = await fetch(
        `http://localhost:8000/api/ai/video-stream-v2/get_token?identity=${crypto.randomUUID()}&room=myroom`,
      );
      const data = await res.json();
      setToken(data.token);
    };
    join();
  }, []);

  if (!token) return <div className='text-center p-4'>Loading...</div>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl='ws://localhost:7880'
      connect
      video
      audio
    >
      <VideoGrid />
    </LiveKitRoom>
  );
}

function VideoGrid() {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);

  return (
    <div className='grid grid-cols-2 gap-4 p-4'>
      {tracks.map(({ publication, participant }) => (
        <Card key={participant.identity} className='p-2 rounded-2xl shadow-lg'>
          <video
            ref={(ref) => {
              if (ref && publication && publication.track) {
                publication.track.attach(ref);
              }
            }}
            autoPlay
            muted={participant.isLocal}
            className='w-full h-auto rounded-xl'
          />
          <div className='text-center mt-2 text-sm text-gray-600'>
            {participant.identity} {participant.isLocal && '(You)'}
          </div>
        </Card>
      ))}
    </div>
  );
}
