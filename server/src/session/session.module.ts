import { Module } from '@nestjs/common';

import { AdminModule } from '@/admin/admin.module';
import { CameraModule } from '@/camera/camera.module';
import { RedisModule } from '@/redis/redis.module';
import { SessionController } from '@/session/session.controller';
import { SessionService } from '@/session/session.service';

@Module({
  imports: [AdminModule, RedisModule, CameraModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
