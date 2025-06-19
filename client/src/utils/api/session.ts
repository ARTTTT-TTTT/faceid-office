import logger from '@/lib/logger';

import { Session } from '@/types/session';

export const startSession = async (): Promise<Session> => {
  try {
    const res = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Start session failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] startSession');
    throw error;
  }
};

export const endSession = async (sessionId: string): Promise<Session> => {
  try {
    const res = await fetch(`/api/sessions/${sessionId}/end`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `End session ${sessionId} failed`);
    }

    return data;
  } catch (error) {
    logger(error, '[API] endSession');
    throw error;
  }
};

export const getSessionStatus = async (): Promise<Session> => {
  try {
    const res = await fetch('/api/sessions/status', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Fetch session status failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] getSessionStatus');
    throw error;
  }
};
