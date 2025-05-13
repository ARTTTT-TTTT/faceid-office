import logger from '@/lib/logger';

import { AI_DETECTIONS, AI_USER_LOGS } from '@/constant/env';

import { UserLog } from '@/types/user-log';

export const sendImageForDetection = async (
  imageBlob: Blob,
  admin_id: string,
  work_start_time: number
): Promise<{
  status: number;
  result: string;
} | null> => {
  try {
    const formData = new FormData();
    formData.append('file', imageBlob);
    formData.append('admin_id', admin_id);
    formData.append('work_start_time', work_start_time.toString());

    const response = await fetch(`${AI_DETECTIONS}/track_faces`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

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
    const response = await fetch(`${AI_USER_LOGS}/user_logs/latest`, {
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
