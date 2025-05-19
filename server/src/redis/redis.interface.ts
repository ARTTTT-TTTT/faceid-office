enum RedisExpiryMode {
  EX = 'EX',
  PX = 'PX',
  EXAT = 'EXAT',
  PXAT = 'PXAT',
  KEEPTTL = 'KEEPTTL',
}

interface RedisSet {
  key: string;
  value: string;
  expiryMode?: RedisExpiryMode;
  time?: number;
}

export type { RedisSet };
export { RedisExpiryMode };
