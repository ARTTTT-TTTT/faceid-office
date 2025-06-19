import { NextRequest, NextResponse } from 'next/server';

import { proxyFetch } from '@/lib/proxy-fetch';

export async function PATCH(req: NextRequest) {
  try {
    const payload = await req.json();

    const response = await proxyFetch('/admin/session-duration', {
      method: 'PATCH',
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
        message: 'Internal server error during update session duration.',
      },
      { status: 500 },
    );
  }
}
