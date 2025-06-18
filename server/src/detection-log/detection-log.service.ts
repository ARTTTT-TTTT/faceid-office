import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

import { CreateDetectionLogDto } from '@/detection-log/dto/create-detection-log.dto';
import { DetectionLogResponse } from '@/detection-log/dto/detection-log-response.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DetectionLogService {
  private readonly unknown = 'UNKNOWN';
  constructor(private readonly prisma: PrismaService) {}

  // * ========== CORE ===========

  async createDetectionLog(
    dto: CreateDetectionLogDto,
    adminId: string,
    detectionImage: Express.Multer.File,
  ) {
    // * Check is unknown with personId
    let isUnknown: boolean;
    let personConnectData: { connect: { id: string } } | undefined;

    if (dto.personId === this.unknown) {
      isUnknown = true;
      personConnectData = undefined;
    } else {
      isUnknown = false;
      personConnectData = { connect: { id: dto.personId } };
    }

    // * Create detection log
    const newDetectionLog = await this.prisma.detectionLog.create({
      data: {
        detectedAt: new Date(),
        isUnknown: isUnknown,
        detectionImagePath: '',
        camera: {
          connect: { id: dto.cameraId },
        },
        session: {
          connect: { id: dto.sessionId },
        },
        person: personConnectData,
      },
    });

    // * Save detection image
    let detectionImagePath: string | undefined;
    if (detectionImage) {
      if (isUnknown === false) {
        detectionImagePath = await this.saveDetectionPersonImageToFileSystem(
          adminId,
          dto.cameraId,
          dto.sessionId,
          dto.personId,
          detectionImage,
        );
      } else {
        detectionImagePath = await this.saveDetectionUnknownImageToFileSystem(
          adminId,
          dto.cameraId,
          dto.sessionId,
          newDetectionLog.id,
          detectionImage,
        );
      }
    }

    // * Update detection log with detection image path
    const detectionLog = await this.prisma.detectionLog.update({
      where: { id: newDetectionLog.id },
      data: {
        detectionImagePath,
      },
    });

    return detectionLog;
  }

  private async saveDetectionPersonImageToFileSystem(
    adminId: string,
    cameraId: string,
    sessionId: string,
    personId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const storageDir = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'storage',
        adminId,
        'detection-images',
        cameraId,
        sessionId,
        'person-images',
      );

      await fs.mkdir(storageDir, { recursive: true });

      const fileExtension = path.extname(file.originalname);
      const newFilename = `${personId}${fileExtension}`;
      const filePath = path.join(storageDir, newFilename);

      await fs.writeFile(filePath, file.buffer);

      return `/storage/${adminId}/detection-images/${cameraId}/${sessionId}/person-images/${newFilename}`;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save detection person image in file system: ' + error,
      );
    }
  }

  private async saveDetectionUnknownImageToFileSystem(
    adminId: string,
    cameraId: string,
    sessionId: string,
    detectionLogId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const storageDir = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'storage',
        adminId,
        'detection-images',
        cameraId,
        sessionId,
        'unknown-images',
      );
      await fs.mkdir(storageDir, { recursive: true });

      const fileExtension = path.extname(file.originalname);
      const newFilename = `${detectionLogId}${fileExtension}`;
      const filePath = path.join(storageDir, newFilename);

      await fs.writeFile(filePath, file.buffer);

      return `/storage/${adminId}/detection-images/${cameraId}/${sessionId}/unknown-images/${newFilename}`;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save detection unknown image in file system: ' + error,
      );
    }
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
            cameras: true,
          },
        },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      detectedAt: log.detectedAt,
      detectionImagePath: log.detectionImagePath,
      camera:
        Array.isArray(log.session.cameras) && log.session.cameras.length > 0
          ? {
              id: log.session.cameras[0].id,
              name: log.session.cameras[0].name,
              location: log.session.cameras[0].location,
            }
          : null,
      person: {
        id: log.person.id,
        fullName: log.person.fullName,
        position: log.person.position,
        profileImageUrl: log.person.profileImagePath,
      },
    }));
  }
}
