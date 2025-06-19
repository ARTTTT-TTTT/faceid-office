import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: Redis,
      useFactory: (configService: ConfigService) => {
        const redisConfig: RedisOptions = {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: Number(configService.get<string>('REDIS_PORT')) || 6379,
          password:
            configService.get<string>('REDIS_PASSWORD') || 'redis_secret',
        };
        //console.log('Connecting to Redis with config:', redisConfig);
        const redisClient = new Redis(redisConfig);
        return redisClient;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
