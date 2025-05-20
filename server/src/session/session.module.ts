import { Module } from '@nestjs/common';

import { AdminModule } from '@/admin/admin.module';
import { DetectionSessionModule } from '@/detection-session/detection-session.module';
import { RedisModule } from '@/redis/redis.module';

import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [AdminModule, DetectionSessionModule, RedisModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
