import { NextRequest, NextResponse } from 'next/server';

import { proxyFetch } from '@/lib/proxy-fetch';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const response = await proxyFetch('/people', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error during create person.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const response = await proxyFetch('/people', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error during fetch people.' },
      { status: 500 },
    );
  }
}
