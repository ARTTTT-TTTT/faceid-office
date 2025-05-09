export const isProd = process.env.NODE_ENV === 'production';
export const isLocal = process.env.NODE_ENV === 'development';

export const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true';

export const serverUrl = isProd
  ? process.env.NEXT_PUBLIC_SERVER_URL
  : 'http://localhost:5000';

export const aiUrl = isProd
  ? process.env.NEXT_PUBLIC_SERVER_URL
  : 'http://localhost:8000';
