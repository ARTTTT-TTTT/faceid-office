import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { CreateDetectionLogDto } from './dto/create-detection-log.dto';
import { DetectionLogResponse } from './dto/detection-log-response.dto';

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

  async getLatestDetectionLogs(limit: number): Promise<DetectionLogResponse[]> {
    const logs = await this.prisma.detectionLog.findMany({
      orderBy: { detectedAt: 'desc' },
      take: limit,
      include: {
        camera: true,
        person: true,
      },
    });

    return logs.map((log) => ({
      id: log.id,
      detectedAt: log.detectedAt,
      imageUrl: log.imageUrl,
      camera: {
        id: log.camera.id,
        name: log.camera.name,
        location: log.camera.location,
      },
      person: {
        id: log.person.id,
        fullName: log.person.fullName,
        position: log.person.position,
        profileImageUrl: log.person.profileImageUrl,
      },
    }));
  }
}
