const isProd = process.env.NODE_ENV === 'production';
const isLocal = process.env.NODE_ENV === 'development';

const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true';

// export const SERVER_URL = isProd
//   ? process.env.NEXT_PUBLIC_SERVER_URL
//   : 'http://localhost:5000';

// export const AI_URL = isProd
//   ? process.env.NEXT_PUBLIC_AI_URL
//   : 'http://localhost:8000/api/ai';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const AI_URL = process.env.NEXT_PUBLIC_AI_URL;

const AI_DETECTIONS = `${AI_URL}${process.env.NEXT_PUBLIC_AI_DETECTIONS_URL}`;
const AI_USER_LOGS = `${AI_URL}${process.env.NEXT_PUBLIC_AI_USER_LOGS_URL}`;
const AI_SETTINGS = `${AI_URL}${process.env.NEXT_PUBLIC_AI_SETTINGS_URL}`;

export {
  AI_DETECTIONS,
  AI_SETTINGS,
  AI_URL,
  AI_USER_LOGS,
  isLocal,
  isProd,
  SERVER_URL,
  showLogger,
};
