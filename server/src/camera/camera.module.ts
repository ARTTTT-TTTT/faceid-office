import { Module } from '@nestjs/common';
import { CameraService } from './camera.service';
import { CameraController } from './camera.controller';

@Module({
  controllers: [CameraController],
  providers: [CameraService],
})
export class CameraModule {}
