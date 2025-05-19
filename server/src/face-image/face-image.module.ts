import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { PrismaModule } from '@/prisma/prisma.module';

import { FaceImageController } from './face-image.controller';
import { FaceImageService } from './face-image.service';

@Module({
  imports: [PrismaModule, MulterModule],
  controllers: [FaceImageController],
  providers: [FaceImageService],
  exports: [FaceImageService],
})
export class FaceImageModule {}
