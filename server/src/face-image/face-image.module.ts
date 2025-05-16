import { Module } from '@nestjs/common';
import { FaceImageService } from './face-image.service';
import { FaceImageController } from './face-image.controller';

@Module({
  controllers: [FaceImageController],
  providers: [FaceImageService],
})
export class FaceImageModule {}
