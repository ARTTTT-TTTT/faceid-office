import { useEffect, useState } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

export function useWebRTC() {
  const [peer, setPeer] = useState<Peer.Instance | null>(null);

  function startPeer(stream: MediaStream) {
    const p = new Peer({ initiator: true, trickle: false, stream });

    p.on('signal', (data) => {
      socket.emit('webrtc_offer', data);
    });

    socket.on('webrtc_answer', (answer) => {
      p.signal(answer);
    });

    setPeer(p);
  }

  useEffect(() => {
    socket.on('detection_result', (result) => {
      console.log('Detected:', result);
    });

    return () => {
      socket.off('detection_result');
    };
  }, []);

  return { peer, startPeer };
}
