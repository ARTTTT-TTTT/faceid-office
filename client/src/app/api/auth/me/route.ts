import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

import { SECRET_KEY } from '@/constants/env';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(SECRET_KEY));

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
