import { NextRequest, NextResponse } from 'next/server';

import { proxyFetch } from '@/lib/proxy-fetch';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Item ID is required.' },
        { status: 400 },
      );
    }

    const response = await proxyFetch(`/sessions/${sessionId}/end`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error during ending session.' },
      { status: 500 },
    );
  }
}
