import { NextRequest, NextResponse } from 'next/server';

import { SERVER_URL } from '@/constants/env';

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: 'Name, email, and password are required.' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${SERVER_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, password }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error during registration.' },
      { status: 500 },
    );
  }
}
