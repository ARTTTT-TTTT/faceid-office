import logger from '@/lib/logger';

import { LoginPayload, Me, RegisterPayload } from '@/types/auth';

export const register = async (payload: RegisterPayload) => {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Registration failed');
    }

    return await res.json();
  } catch (error) {
    logger(error, '[API] register error:');
    throw error;
  }
};

export const login = async (payload: LoginPayload) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] login error:');
    throw error;
  }
};

export const logout = async () => {
  try {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Logout failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] logout error:');
    throw error;
  }
};

export const me = async (): Promise<Me> => {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Fetch me failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] me error:');
    throw error;
  }
};
