import { NextRequest, NextResponse } from 'next/server';

import { proxyFetch } from '@/lib/proxy-fetch';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    const response = await proxyFetch(
      `/detection-logs/latest?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error during fetching items list.' },
      { status: 500 },
    );
  }
}
