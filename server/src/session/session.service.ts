import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { AdminService } from '@/admin/admin.service';
import { CameraService } from '@/camera/camera.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { SessionStatusResponseDto } from '@/session/dto/session-response.dto';
import { CameraResultEntry, SessionStatus } from '@/session/session.interface';

@Injectable()
export class SessionService {
  private readonly adminPrefix = 'admin';
  private readonly cameraPrefix = 'camera';
  private readonly personPrefix = 'person';
  private readonly trackingSuffix = 'tracking';

  constructor(
    private readonly redisService: RedisService,
    private readonly adminService: AdminService,
    private readonly cameraService: CameraService,
    private readonly prisma: PrismaService,
  ) {}

  private _buildKey(adminId: string, cameraId: string, personId: string) {
    return `${this.adminPrefix}:${adminId}:${this.cameraPrefix}:${cameraId}:${this.personPrefix}:${personId}`;
  }

  // * ========== CORE ===========

  private buildMarkerKey(adminId: string, cameraId: string) {
    return `${this.adminPrefix}:${adminId}:${this.cameraPrefix}:${cameraId}:${this.trackingSuffix}`;
  }

  async startSession(adminId: string): Promise<SessionStatusResponseDto> {
    // TODO: try catch redis key logic
    const cameraList = await this.cameraService.getCameras(adminId);
    if (cameraList.length === 0) {
      throw new NotFoundException(
        `Admin ${adminId} There is no camera to start the session.`,
      );
    }
    const sessionDuration = await this.adminService.getSessionDuration(adminId);

    // * Manage Redis keys for each camera tracking
    const cameras: CameraResultEntry[] = [];

    for (const camera of cameraList) {
      const cameraId = camera.id;
      const result = await this.handleSingleCameraSession(
        adminId,
        cameraId,
        sessionDuration,
      );

      cameras.push({
        cameraId: result.cameraId,
        TTL: result.TTL,
        markerKey: result.markerKey,
      });
    }

    // * Create session
    const session = await this.prisma.session.create({
      data: {
        admin: { connect: { id: adminId } },
        cameras: {
          connect: cameraList.map((camera) => ({ id: camera.id })),
        },
      },
    });

    return {
      sessionId: session.id,
      cameras,
      status: SessionStatus.START,
    };
  }

  private async handleSingleCameraSession(
    adminId: string,
    cameraId: string,
    sessionDuration: number,
  ): Promise<CameraResultEntry> {
    const markerKey = this.buildMarkerKey(adminId, cameraId);
    const markerExists = await this.redisService.exists(markerKey);

    if (markerExists) {
      throw new ConflictException(
        `Failed to start session for camera ${cameraId}: Marker already exists.`,
      );
    }

    await this.redisService.setex(markerKey, sessionDuration, '1');
    const ttl = await this.redisService.ttl(markerKey);

    if (ttl > 0) {
      return {
        cameraId,
        TTL: ttl,
        markerKey,
      };
    }

    throw new InternalServerErrorException(
      `Failed to start session for camera ${cameraId}: Failed to verify TTL after setting.`,
    );
  }

  async endSession(
    adminId: string,
    sessionId: string,
  ): Promise<SessionStatusResponseDto> {
    const cameraList = await this.cameraService.getCameras(adminId);

    // * Update session
    const session = await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        adminId: adminId,
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
      },
    });
    if (session.count === 0) {
      throw new NotFoundException(
        `Session with ID ${sessionId} not found, already ended, or not owned by admin.`,
      );
    }

    // * Manage Redis keys for each camera tracking
    const cameras: CameraResultEntry[] = [];

    for (const camera of cameraList) {
      const cameraId = camera.id;
      const markerKey = this.buildMarkerKey(adminId, cameraId);

      try {
        const delCount = await this.redisService.del(markerKey);

        if (delCount > 0) {
          cameras.push({
            cameraId,
            TTL: null,
            markerKey,
          });
        } else {
          throw new ConflictException(
            `Failed to end session for camera ${cameraId}: Marker not found or already deleted.`,
          );
        }
      } catch (error) {
        throw new InternalServerErrorException(
          `Failed to end session for camera ${cameraId}: \n error: ${error}`,
        );
      }
    }

    return {
      sessionId,
      cameras,
      status: SessionStatus.END,
    };
  }

  async getSessionStatus(adminId: string): Promise<SessionStatusResponseDto> {
    const cameraList = await this.cameraService.getCameras(adminId);

    // * Get the latest active session of Admin.
    const session = await this.prisma.session.findFirst({
      where: {
        adminId: adminId,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // * If not found, it is considered an end status.
    if (!session) {
      for (const camera of cameraList) {
        const cameraId = camera.id;
        const markerKey = this.buildMarkerKey(adminId, cameraId);
        await this.redisService.del(markerKey);
      }
      return {
        sessionId: null,
        cameras: [],
        status: SessionStatus.END,
      };
    }

    // * If Active Session is found, check the Redis marker key of all Admin cameras.
    const camerasStatus: CameraResultEntry[] = [];
    let isAnyCameraMarkerMissing = false;

    for (const camera of cameraList) {
      const cameraId = camera.id;
      const markerKey = this.buildMarkerKey(adminId, cameraId);
      const exists = await this.redisService.exists(markerKey);

      if (exists) {
        const ttl = await this.redisService.ttl(markerKey);
        camerasStatus.push({
          cameraId,
          TTL: ttl,
          markerKey,
        });
      } else {
        isAnyCameraMarkerMissing = true;
        camerasStatus.push({
          cameraId,
          TTL: null,
          markerKey,
        });
      }
    }

    // * Consider the overall session status.
    let currentSessionStatus: SessionStatus;
    if (isAnyCameraMarkerMissing) {
      currentSessionStatus = SessionStatus.END;

      await this.prisma.session.update({
        where: { id: session.id },
        data: { endedAt: new Date() },
      });
    } else {
      currentSessionStatus = SessionStatus.START;
    }

    return {
      sessionId: session.id,
      cameras: camerasStatus,
      status: currentSessionStatus,
    };
  }
}
