const isProd = process.env.NODE_ENV === 'production';
const isLocal = process.env.NODE_ENV === 'development';

const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true';

// TODO: Check NEXT_PUBLIC_

const SERVER_URL = process.env.SERVER_URL;
const WS_URL = process.env.WS_URL;

const SECRET_KEY = process.env.SECRET_KEY;

export { isLocal, isProd, SECRET_KEY, SERVER_URL, showLogger, WS_URL };
