const isProd = process.env.NODE_ENV === 'production';
const isLocal = process.env.NODE_ENV === 'development';

const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const SERVER_AUTH_URL = `${SERVER_URL}${process.env.NEXT_PUBLIC_SERVER_AUTH_URL}`;

const AI_URL = process.env.NEXT_PUBLIC_AI_URL;
const AI_VECTORS_URL = `${AI_URL}${process.env.NEXT_PUBLIC_AI_VECTORS_URL}`;

const WS_AI_URL = process.env.NEXT_PUBLIC_WS_AI_URL;

export {
  AI_URL,
  AI_VECTORS_URL,
  isLocal,
  isProd,
  SERVER_AUTH_URL,
  SERVER_URL,
  showLogger,
  WS_AI_URL,
};
