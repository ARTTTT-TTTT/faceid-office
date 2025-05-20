import { Injectable } from '@nestjs/common';

import { AdminService } from '@/admin/admin.service';
import { CameraService } from '@/camera/camera.service';
import { DetectionSessionService } from '@/detection-session/detection-session.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';

import {
  FailedCamera,
  HandleCameraResult,
  ResultEntry,
  RetryResult,
  SessionStatus,
  StartSessionResult,
} from './session.interface';

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
    private readonly detectionSessionService: DetectionSessionService,
    private readonly prisma: PrismaService,
  ) {}

  private buildKey(adminId: string, cameraId: string, personId: string) {
    return `${this.adminPrefix}:${adminId}:${this.cameraPrefix}:${cameraId}:${this.personPrefix}:${personId}`;
  }

  private buildMarkerKey(adminId: string, cameraId: string) {
    return `${this.adminPrefix}:${adminId}:${this.cameraPrefix}:${cameraId}:${this.trackingSuffix}`;
  }

  async startSession(adminId: string): Promise<StartSessionResult> {
    const cameras = await this.cameraService.getCameras(adminId);
    const sessionDuration = await this.adminService.getSessionDuration(adminId);

    const results: ResultEntry[] = [];
    const createdKeys: string[] = [];
    const failedCameras: FailedCamera[] = [];

    for (const camera of cameras) {
      const cameraId = camera.id;
      const result = await this.handleSingleCameraSession(
        adminId,
        cameraId,
        sessionDuration,
      );

      results.push({ cameraId: result.cameraId, TTL: result.TTL });

      if (result.success) {
        createdKeys.push(result.markerKey);
      } else {
        failedCameras.push({
          cameraId: result.cameraId,
          markerKey: result.markerKey,
        });
      }
    }

    const retry = await this.retryFailedCameras(failedCameras, sessionDuration);
    results.push(...retry.results);
    createdKeys.push(...retry.createdKeys);

    const totalExpected = cameras.length;
    const totalCreated = createdKeys.length;

    return {
      results,
      summary: {
        success: totalCreated === totalExpected,
        totalExpected,
        totalCreated,
        failed: totalExpected - totalCreated,
      },
    };
  }

  private async handleSingleCameraSession(
    adminId: string,
    cameraId: string,
    sessionDuration: number,
  ): Promise<HandleCameraResult> {
    const markerKey = this.buildMarkerKey(adminId, cameraId);
    const markerExists = await this.redisService.exists(markerKey);

    if (markerExists) {
      await this.stopExistingSession(adminId, cameraId);
      return {
        cameraId,
        TTL: 'Failed to start session (marker still exists)',
        success: false,
        markerKey,
      };
    }

    await this.redisService.setex(markerKey, sessionDuration, '1');
    const ttl = await this.redisService.ttl(markerKey);

    if (ttl > 0) {
      await this.detectionSessionService.createSession(cameraId);
      return {
        cameraId,
        TTL: `Session started with TTL: ${ttl}s`,
        success: true,
        markerKey,
      };
    }

    return {
      cameraId,
      TTL: 'Failed to verify TTL after setting',
      success: false,
      markerKey,
    };
  }

  private async retryFailedCameras(
    failedCameras: { cameraId: string; markerKey: string }[],
    sessionDuration: number,
  ): Promise<RetryResult> {
    const retryResults: { cameraId: string; TTL: string }[] = [];
    const createdKeys: string[] = [];

    for (const { cameraId, markerKey } of failedCameras) {
      await this.redisService.setex(markerKey, sessionDuration, '1');
      const retryTtl = await this.redisService.ttl(markerKey);

      if (retryTtl > 0) {
        createdKeys.push(markerKey);
        await this.detectionSessionService.createSession(cameraId);
        retryResults.push({
          cameraId,
          TTL: `Retry success: Session started with TTL: ${retryTtl}s`,
        });
      } else {
        retryResults.push({
          cameraId,
          TTL: `Retry failed again`,
        });
      }
    }

    return { results: retryResults, createdKeys };
  }

  async endSession(adminId: string): Promise<void> {
    const adminProfile = await this.adminService.getProfile(adminId);

    for (const camera of adminProfile.cameras) {
      const cameraId = camera.id;

      await this.detectionSessionService.endSessionsByCameraId(cameraId);

      // Delete Redis marker key
      const markerKey = this.buildMarkerKey(adminId, cameraId);
      await this.redisService.del(markerKey);
    }
  }

  async getSessions(cameraId: string): Promise<any[]> {
    return this.prisma.detectionSession.findMany({
      where: { cameraId: cameraId },
    });
  }

  // Function เพิ่มเติมสำหรับหยุด Session ที่อาจค้างอยู่ (อ้างอิงจาก logic ใน startSession ของ Python)
  private async stopExistingSession(
    adminId: string,
    cameraId: string,
  ): Promise<void> {
    // Logic ในส่วนนี้อาจซับซ้อนขึ้นอยู่กับว่าคุณเก็บข้อมูล Session ที่กำลังทำงานไว้อย่างไรใน Redis
    // ตัวอย่างเช่น คุณอาจมี Set ของ Session IDs ที่กำลังทำงานอยู่
    // หรือคุณอาจต้อง Scan Keys ที่มี Pattern เกี่ยวข้องกับ Session นั้นๆ

    // ในตัวอย่างนี้ เราจะลองลบ Marker Key เท่านั้น
    const markerKey = this.buildMarkerKey(adminId, cameraId);
    await this.redisService.del(markerKey);

    // คุณอาจต้องมี Logic เพิ่มเติมเพื่อ End Session ใน Prisma ด้วย
    // เช่น Query หา Session ที่ startedAt มีค่า และ endedAt เป็น null
    // และทำการ Update endedAt
    await this.prisma.detectionSession.updateMany({
      where: {
        cameraId: cameraId,
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
      },
    });
  }

  async getSessionStatus(adminId: string): Promise<SessionStatus[]> {
    const cameras = await this.cameraService.getCameras(adminId);
    const results: {
      cameraId: string;
      status: 'start' | 'end';
      TTL: number | null;
    }[] = [];

    for (const camera of cameras) {
      const cameraId = camera.id;
      const markerKey = this.buildMarkerKey(adminId, cameraId);
      const exists = await this.redisService.exists(markerKey);

      if (exists) {
        const ttl: number = await this.redisService.ttl(markerKey);
        results.push({
          cameraId,
          status: 'start',
          TTL: ttl,
        });
      } else {
        results.push({
          cameraId,
          status: 'end',
          TTL: null,
        });
      }
    }

    return results;
  }
}
