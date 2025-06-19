import { NextResponse } from 'next/server';

import { proxyFetch } from '@/lib/proxy-fetch';

export async function GET() {
  try {
    const response = await proxyFetch('/admin/settings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: `Internal server error during fetch settings.`,
      },
      { status: 500 },
    );
  }
}
