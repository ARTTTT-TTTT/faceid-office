import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisExpiryMode, RedisSet } from '@/redis/redis.interface';

@Injectable()
export class RedisService {
  constructor(@Inject(Redis) private readonly redisClient: Redis) {}

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set({
    key,
    value,
    expiryMode,
    time,
  }: RedisSet): Promise<string | null> {
    if (expiryMode && time) {
      switch (expiryMode) {
        case RedisExpiryMode.EX:
          return this.redisClient.set(key, value, 'EX', time);
        case RedisExpiryMode.PX:
          return this.redisClient.set(key, value, 'PX', time);
        case RedisExpiryMode.EXAT:
          return this.redisClient.set(key, value, 'EXAT', time);
        case RedisExpiryMode.PXAT:
          return this.redisClient.set(key, value, 'PXAT', time);
        case RedisExpiryMode.KEEPTTL:
          return this.redisClient.set(key, value, 'KEEPTTL');
        default:
          return null;
      }
    }
    return this.redisClient.set(key, value);
  }

  async setex(
    key: string,
    seconds: number,
    value: string,
  ): Promise<string | null> {
    return this.redisClient.setex(key, seconds, value);
  }

  async del(keys: string | string[]): Promise<number> {
    if (Array.isArray(keys)) {
      return this.redisClient.del(...keys);
    }
    return this.redisClient.del(keys);
  }

  async incr(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.redisClient.decr(key);
  }
}
