import logger from '@/lib/logger';

import { WS_AI_URL } from '@/constants/env';

export const createWebSocket = (
  onMessage: (data: unknown) => void,
  remoteCanvasRef: React.RefObject<HTMLCanvasElement>,
): WebSocket => {
  const ws = new WebSocket(`${WS_AI_URL}/${crypto.randomUUID()}`);
  ws.onopen = () => logger('WebSocket connected');
  ws.onmessage = (event) => {
    if (typeof event.data === 'string') {
      try {
        const result = JSON.parse(event.data);
        onMessage(result);
      } catch (error) {
        logger(error, 'Failed to parse tracking result:');
      }
    } else {
      const blob = new Blob([event.data], { type: 'image/jpeg' });
      const img = new Image();
      img.onload = () => {
        const remoteCtx = remoteCanvasRef.current?.getContext('2d');
        const canvas = remoteCanvasRef.current;
        if (remoteCtx && canvas) {
          remoteCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(blob);
    }
  };
  return ws;
};
