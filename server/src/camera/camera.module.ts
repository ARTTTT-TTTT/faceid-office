import { Module } from '@nestjs/common';

import { CameraController } from '@/camera/camera.controller';
import { CameraService } from '@/camera/camera.service';

@Module({
  exports: [CameraService],
  controllers: [CameraController],
  providers: [CameraService],
})
export class CameraModule {}
