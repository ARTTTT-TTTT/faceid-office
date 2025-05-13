import logger from '@/lib/logger';

import { AI_SETTINGS } from '@/constant/env';

import {
  RedisStartStatus,
  RedisStopStatus,
  Setting,
  SettingCreatePayload,
  SettingUpdatePayload,
} from '@/types/setting';

export const startRedis = async (admin_id: string) => {
  try {
    const response = await fetch(`${AI_SETTINGS}/redis/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ admin_id: admin_id }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger(error, '[API] startRedis');
    return null;
  }
};

export const stopRedis = async (admin_id: string) => {
  try {
    const response = await fetch(`${AI_SETTINGS}/redis/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ admin_id: admin_id }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger(error, '[API] stopRedis');
    return null;
  }
};

export const fetchRedisStatus = async (
  admin_id: string
): Promise<RedisStartStatus | RedisStopStatus | null> => {
  try {
    const response = await fetch(
      `${AI_SETTINGS}/redis/status?admin_id=${admin_id}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger(error, '[API] fetchRedisStatus');
    return null;
  }
};

export const fetchSetting = async (): Promise<Setting | null> => {
  try {
    const response = await fetch(`${AI_SETTINGS}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger(error, '[API] fetchSetting');
    return null;
  }
};

export const createSetting = async ({
  user_log_expire_seconds,
  work_start_time,
}: SettingCreatePayload) => {
  try {
    const response = await fetch(`${AI_SETTINGS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        work_start_time: work_start_time,
        user_log_expire_seconds: user_log_expire_seconds,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger(error, '[API] fetchLatestUserLogs');
    return null;
  }
};

export const updateSetting = async ({
  id,
  user_log_expire_seconds,
  work_start_time,
}: SettingUpdatePayload) => {
  try {
    const response = await fetch(`${AI_SETTINGS}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: id,
        work_start_time: work_start_time,
        user_log_expire_seconds: user_log_expire_seconds,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update setting');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger(error, '[API] updateSetting');
    return null;
  }
};
