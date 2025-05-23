import { useEffect, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

// Connect to your backend WebSocket (adjust the URL if needed)
const socket = io("http://localhost:8000"); // Same as your FastAPI WebSocket server

export function useWebRTC() {
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const [detectionResult, setDetectionResult] = useState<any>(null); // You can type this more specifically

  function startPeer(stream: MediaStream) {
    const p = new Peer({ initiator: true, trickle: false, stream });

p.on('signal', (data) => {
  if ('sdp' in data && 'type' in data) {
    // Only send if it's an SDP offer/answer (not ICE candidate)
    fetch('http://localhost:8000/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sdp: data.sdp,
        type: data.type,
      }),
    })
      .then((res) => res.json())
      .then((answer) => {
        console.log('✅ Answer received', answer);
        p.signal(answer);
      })
      .catch((err) => console.error('❌ WebRTC offer error:', err));
  }
});

    socket.on("webrtc_answer", (answer) => {
      console.log('✅ Answer received', answer); // Add this
      p.signal(answer);
    });

    setPeer(p);
  }

  useEffect(() => {
    socket.on("detection_result", (result) => {
      console.log("🔍 Detected:", result);
      setDetectionResult(result);
    });

    return () => {
      socket.off("detection_result");
    };
  }, []);

  return { peer, startPeer, detectionResult };
}
