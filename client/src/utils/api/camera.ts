import logger from '@/lib/logger';

import { Camera, CreateCameraPayload } from '@/types/camera';

export const createCamera = async (
  payload: Partial<CreateCameraPayload>,
): Promise<Camera> => {
  try {
    const res = await fetch('/api/cameras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Create camera failed`);
    }

    return data;
  } catch (error) {
    logger(error, '[API] createCamera');
    throw error;
  }
};
