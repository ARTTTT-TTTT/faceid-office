import { getCookie } from 'cookies-next';

export const fetchWithAuth = async (
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> => {
  const token = getCookie('access_token');

  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
};
