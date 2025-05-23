import { useEffect, useState } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';

import logger from '@/lib/logger';

const socket = io('http://localhost:8000');

export function useWebRTC() {
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const [detectionResult, setDetectionResult] = useState(null);

  function startPeer(stream: MediaStream) {
    const p = new Peer({ initiator: true, trickle: false, stream });
    p.on('signal', (data) => {
      if ('sdp' in data && 'type' in data) {
        fetch('http://localhost:8000/api/ai/videos/offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sdp: data.sdp,
            type: data.type,
          }),
        })
          .then((res) => res.json())
          .then((answer) => {
            logger(answer, '✅ Answer received');
            p.signal(answer);
          })
          .catch((err) => logger(err, '❌ WebRTC offer error:'));
      }
    });

    socket.on('webrtc_answer', (answer) => {
      logger(answer, '✅ Answer received');
      p.signal(answer);
    });

    setPeer(p);
  }

  useEffect(() => {
    socket.on('detection_result', (result) => {
      logger(result, '🔍 Detected:');
      setDetectionResult(result);
    });

    return () => {
      socket.off('detection_result');
    };
  }, []);

  return { peer, startPeer, detectionResult };
}
