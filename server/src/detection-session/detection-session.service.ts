import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DetectionSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(cameraId: string): Promise<void> {
    await this.prisma.detectionSession.create({
      data: {
        cameraId,
      },
    });
  }

  async endSessionsByCameraId(cameraId: string): Promise<void> {
    await this.prisma.detectionSession.updateMany({
      where: {
        cameraId,
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
      },
    });
  }
}
