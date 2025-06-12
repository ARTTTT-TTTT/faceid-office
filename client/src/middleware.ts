import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

import logger from '@/lib/logger';

import { SECRET_KEY } from '@/constants/env';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  const url = req.nextUrl.clone();
  url.pathname = '/login';

  if (!token && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(url);
  }

  if (!token) {
    return NextResponse.next();
  }

  try {
    if (!SECRET_KEY) {
      throw new Error('SECRET_KEY is not defined');
    }

    const encoder = new TextEncoder();

    // * SOLUTION: 1
    // const { payload } = await jwtVerify(token, encoder.encode(SECRET_KEY));

    // const requestHeaders = new Headers(req.headers);
    // requestHeaders.set('x-user', JSON.stringify(payload));

    // return NextResponse.next({
    //   request: {
    //     headers: requestHeaders,
    //   },
    // });

    // * SOLUTION: 2
    await jwtVerify(token, encoder.encode(SECRET_KEY));
    return NextResponse.next();
  } catch (error) {
    logger(error, 'Token verification failed:');
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/detection/:path*',
    '/settings/:path*',
    '/dashboard/:path*',
    '/api/auth/me',
  ],
};
