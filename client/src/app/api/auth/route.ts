import { setCookie } from 'cookies-next';

import logger from '@/lib/logger';

import { SERVER_AUTH_URL } from '@/constants/env';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const registerAdmin = async (payload: RegisterPayload) => {
  try {
    const res = await fetch(`${SERVER_AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    logger(error, '[API] registerAdmin');
    throw error;
  }
};

interface LoginPayload {
  email: string;
  password: string;
}

export const loginAdmin = async (payload: LoginPayload) => {
  try {
    const res = await fetch(`${SERVER_AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setCookie('access_token', data.access_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return;
  } catch (error) {
    logger(error, '[API] loginAdmin');
    throw error;
  }
};
