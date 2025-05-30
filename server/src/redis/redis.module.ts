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
          host: configService.get<string>('REDIS_HOSTS') || 'localhost',
          port: Number(configService.get<string>('REDIS_PORTS')) || 6379,
          password: configService.get<string>('REDIS_PASS') || undefined,
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
