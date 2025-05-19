/* eslint-disable no-console */
import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

import { RedisService } from './redis.service';

// ?FEATURE Check restart redis

@Global()
@Module({
  providers: [
    {
      provide: Redis,
      useFactory: (configService: ConfigService) => {
        const redisConfig: RedisOptions = {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        };
        const redisClient = new Redis(redisConfig);

        redisClient.on('connect', () => {
          console.log('🚀 Connected to Redis');
        });

        redisClient.on('error', (error: Error) => {
          console.error('❌ Redis connection error:', error);
        });

        return redisClient;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(Redis) private readonly redisClient: Redis) {}

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
