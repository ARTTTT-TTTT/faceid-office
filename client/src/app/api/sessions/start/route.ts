import { NextResponse } from 'next/server';

import { proxyFetch } from '@/lib/proxy-fetch';

export async function POST() {
  try {
    const response = await proxyFetch('/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Internal server error during starting session.',
      },
      { status: 500 },
    );
  }
}
