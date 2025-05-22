import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { FaceImageService } from './face-image.service';

@Module({
  imports: [MulterModule],
  providers: [FaceImageService],
  exports: [FaceImageService],
})
export class FaceImageModule {}
