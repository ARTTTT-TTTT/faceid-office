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
        cameraId: dto.cameraId,
        session: {
          connect: { id: dto.sessionId },
        },
        person: {
          connect: { id: dto.personId },
        },
      },
    });
  }

  async getLatestDetectionLogs(
    sessionId: string,
    limit: number,
  ): Promise<DetectionLogResponse[]> {
    const logs = await this.prisma.detectionLog.findMany({
      where: {
        sessionId: sessionId,
      },
      orderBy: {
        detectedAt: 'desc',
      },
      take: limit,
      include: {
        person: true,
        session: {
          include: {
            camera: true,
          },
        },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      detectedAt: log.detectedAt,
      imageUrl: log.imageUrl,
      camera: log.session.camera
        ? {
            id: log.session.camera.id,
            name: log.session.camera.name,
            location: log.session.camera.location,
          }
        : null,
      person: {
        id: log.person.id,
        fullName: log.person.fullName,
        position: log.person.position,
        profileImagePath: log.person.profileImagePath,
      },
    }));
  }
}
