import { cookies } from 'next/headers';

import { SERVER_URL } from '@/constants/env';

export async function proxyFetch(path: string, init?: RequestInit) {
  const access_token = cookies().get('access_token')?.value;

  return fetch(`${SERVER_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${access_token}`,
    },
    cache: 'no-store',
  });
}
