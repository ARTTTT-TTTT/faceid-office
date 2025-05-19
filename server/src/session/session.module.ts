import { Module } from '@nestjs/common';

import { AdminModule } from '@/admin/admin.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { RedisModule } from '@/redis/redis.module';

import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [PrismaModule, AdminModule, RedisModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
