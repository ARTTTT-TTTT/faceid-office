import { serialize } from 'cookie';
import { NextRequest, NextResponse } from 'next/server';

import { SERVER_URL } from '@/constants/env';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 },
      );
    }

    const response = await fetch(`${SERVER_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const serializedCookie = serialize('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    const successResponse = NextResponse.json(
      { success: true },
      { status: 200 },
    );
    successResponse.headers.set('Set-Cookie', serializedCookie);

    return successResponse;
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error during login.' },
      { status: 500 },
    );
  }
}
