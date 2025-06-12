const isProd = process.env.NODE_ENV === 'production';
const isLocal = process.env.NODE_ENV === 'development';

const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true';

// TODO: Check NEXT_PUBLIC_

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const AI_URL = process.env.NEXT_PUBLIC_AI_URL;
const WS_AI_URL = process.env.NEXT_PUBLIC_WS_AI_URL;

const SECRET_KEY = process.env.SECRET_KEY;

export {
  AI_URL,
  isLocal,
  isProd,
  SECRET_KEY,
  SERVER_URL,
  showLogger,
  WS_AI_URL,
};
