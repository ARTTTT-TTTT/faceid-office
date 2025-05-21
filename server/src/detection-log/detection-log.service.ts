import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { CreateDetectionLogDto } from './dto/create-detection-log.dto';

@Injectable()
export class DetectionLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createDetectionLog(dto: CreateDetectionLogDto) {
    return await this.prisma.detectionLog.create({
      data: {
        detectedAt: new Date(),
        imageUrl: dto.imageUrl,
        session: {
          connect: { id: dto.sessionId },
        },
        person: {
          connect: { id: dto.personId },
        },
        camera: {
          connect: { id: dto.cameraId },
        },
      },
    });
  }
}
