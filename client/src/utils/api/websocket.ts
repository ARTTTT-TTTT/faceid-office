import logger from '@/lib/logger';

import { WS_URL } from '@/constants/env';

import { FaceTrackingResult } from '@/types/websocket';

export const createWebSocket = (
  access_token: string,
  camera_id: string,
  session_id: string,
  session_duration: number,
  onMessageImage: (imageData: string) => void,
  onMessageResult: (results: FaceTrackingResult) => void,
): WebSocket => {
  const ws = new WebSocket(
    `${WS_URL}/${camera_id}/${session_id}/${session_duration}`,
  );

  ws.onopen = () => {
    logger('WebSocket connected');
    ws.send(JSON.stringify({ type: 'authenticate', token: access_token }));
  };

  ws.onmessage = (event) => {
    if (typeof event.data === 'string') {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'auth_fail') {
          logger('Authentication failed');
          ws.close();
        }
        if (parsed.image) {
          onMessageImage(parsed.image);
        }
        if (parsed.result) {
          onMessageResult(parsed.result);
        }
      } catch (error) {
        logger(error, 'Failed to parse message:');
      }
    }
  };
  return ws;
};
