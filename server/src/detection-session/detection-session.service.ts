import { Injectable } from '@nestjs/common';
import { DetectionSession } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DetectionSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(cameraId: string): Promise<DetectionSession> {
    const session = await this.prisma.detectionSession.create({
      data: {
        cameraId,
      },
    });
    return session;
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
