import { NextRequest, NextResponse } from 'next/server';

import { proxyFetch } from '@/lib/proxy-fetch';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const response = await proxyFetch('/cameras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Internal server error during camera creation.',
      },
      { status: 500 },
    );
  }
}
