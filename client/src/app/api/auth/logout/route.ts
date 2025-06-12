import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const serializedCookie = serialize('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set('Set-Cookie', serializedCookie);

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error during logout.' },
      { status: 500 },
    );
  }
}
