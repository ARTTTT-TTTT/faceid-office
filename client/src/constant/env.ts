const isProd = process.env.NODE_ENV === 'production';
const isLocal = process.env.NODE_ENV === 'development';

const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true';

// export const SERVER_URL = isProd
//   ? process.env.NEXT_PUBLIC_SERVER_URL
//   : 'http://localhost:5000';

// export const AI_URL = isProd
//   ? process.env.NEXT_PUBLIC_SERVER_URL
//   : 'http://localhost:8000/api/ai';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const AI_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export { AI_URL, isLocal, isProd, SERVER_URL, showLogger };
