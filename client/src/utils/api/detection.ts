import logger from '@/lib/logger';

import { WS_AI_URL } from '@/constants/env';

import { FaceTrackingResult } from '@/types/detection';

export const createWebSocket = (
  admin_id: string,
  onMessageImage: (imageData: string) => void,
  onMessageResult: (results: FaceTrackingResult[]) => void,
): WebSocket => {
  const ws = new WebSocket(`${WS_AI_URL}/${admin_id}`);
  ws.onopen = () => logger('WebSocket connected');
  ws.onmessage = (event) => {
    if (typeof event.data === 'string') {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.image) {
          onMessageImage(parsed.image);
        }
        if (Array.isArray(parsed.result) && parsed.result.length > 0) {
          onMessageResult(parsed.result);
        }
      } catch (error) {
        logger(error, 'Failed to parse message:');
      }
    }
  };
  return ws;
};
