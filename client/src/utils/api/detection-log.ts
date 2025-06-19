import logger from '@/lib/logger';

import {
  DetectionPersonResponse,
  DetectionUnknownResponse,
  LatestDetectionLogPayload,
} from '@/types/detection-log';

export const getLatestDetectionLogs = async (
  payload: LatestDetectionLogPayload,
): Promise<DetectionPersonResponse[] | DetectionUnknownResponse[]> => {
  try {
    const queryParams = new URLSearchParams({
      isUnknown: payload.isUnknown.toString(),
      limit: payload.limit.toString(),
      sessionId: payload.sessionId,
      cameraId: payload.cameraId,
    }).toString();

    const res = await fetch(`api/detection-logs/latest?${queryParams}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Fetch list failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] getLatestDetectionLogs');
    throw error;
  }
};
