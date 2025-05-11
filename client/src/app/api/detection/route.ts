import logger from '@/lib/logger';

import { AI_URL } from '@/constant/env';

import { UserLog } from '@/types/user-log';

export const sendImageForDetection = async (
  imageBlob: Blob
): Promise<{
  status: number;
  result: string;
} | null> => {
  try {
    const formData = new FormData();
    formData.append('file', imageBlob);

    const response = await fetch(`${AI_URL}/track_faces`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    return {
      status: response.status,
      result: result.result,
    };
  } catch (error) {
    logger(error, '[API] sendImageForDetection');
    return null;
  }
};

export const fetchLatestUserLogs = async (): Promise<UserLog[]> => {
  try {
    const response = await fetch(`${AI_URL}/latest_logs`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger(error, '[API] fetchLatestUserLogs');
    return [];
  }
};
