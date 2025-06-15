import logger from '@/lib/logger';

import { AdminSettings, updateSessionDurationPayload } from '@/types/admin';

export const getSettings = async (): Promise<AdminSettings> => {
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Fetch settings failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] getSettings');
    throw error;
  }
};

export const updateSessionDuration = async (
  payload: Partial<updateSessionDurationPayload>,
): Promise<AdminSettings> => {
  try {
    const res = await fetch('/api/admin/session-duration', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Update session duration failed`);
    }

    return data;
  } catch (error) {
    logger(error, '[API] updateSessionDuration');
    throw error;
  }
};
