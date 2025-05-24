'use client';

import { LiveKitRoom, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect, useState } from 'react';
import '@livekit/components-styles';

import { Card } from '@/components/ui/card';

export default function VideoStreamV2() {
  const [token, setToken] = useState<string | null>(null);
  const [turnCreds, setTurnCreds] = useState<{
    username: string;
    credential: string;
  } | null>(null);

  useEffect(() => {
    const join = async () => {
      const res = await fetch(
        `http://localhost:8000/api/ai/video-stream-v2/token?identity=${crypto.randomUUID()}&room=myroom`,
      );
      const data = await res.json();
      setToken(data.token);

      const turnRes = await fetch(
        'http://localhost:8000/api/ai/video-stream-v2/turn_credentials',
      );
      const turnData = await turnRes.json();
      setTurnCreds(turnData);
    };
    join();
  }, []);

  if (!token || !turnCreds)
    return <div className='text-center p-4'>Loading...</div>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880'}
      connect={true}
      video={true}
      audio={false}
      connectOptions={{
        autoSubscribe: true,
        rtcConfig: {
          iceTransportPolicy: 'all',
          iceServers: [
            {
              urls: ['stun:localhost:3478'],
            },
            {
              urls: ['turn:localhost:3478?transport=udp'],
              username: turnCreds.username,
              credential: turnCreds.credential,
            },
            {
              urls: ['turn:localhost:3478?transport=tcp'],
              username: turnCreds.username,
              credential: turnCreds.credential,
            },
          ],
        },
      }}
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
