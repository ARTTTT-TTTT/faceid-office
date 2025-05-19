import { Injectable } from '@nestjs/common';

import { AdminService } from '@/admin/admin.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { StartSessionDto } from '@/session/dto/start-session.dto';
import { RedisStart } from '@/session/redis.interface';

@Injectable()
export class SessionService {
  private readonly adminPrefix = 'admin';
  private readonly cameraPrefix = 'camera';
  private readonly personPrefix = 'person';
  private readonly trackingSuffix = 'tracking';

  constructor(
    private readonly redisService: RedisService,
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService,
  ) {}

  private buildKey(adminId: string, cameraId: string, personId: string = '*') {
    return `${this.adminPrefix}:${adminId}:${this.cameraPrefix}:${cameraId}:${this.personPrefix}:${personId}`;
  }

  private buildMarkerKey(adminId: string, cameraId: string) {
    return `${this.adminPrefix}:${adminId}:${this.cameraPrefix}:${cameraId}:${this.trackingSuffix}`;
  }

  async startSession(startSessionDto: StartSessionDto): Promise<RedisStart> {
    // !TEST start session, end session
    // !FEATURE เพิ่ม getSessionDuration
    // const ttlSeconds = await this.adminService.getSessionDuration();
    const adminProfile = await this.adminService.getProfile(
      startSessionDto.adminId,
    );
    const markerKey = this.buildMarkerKey(
      startSessionDto.adminId,
      startSessionDto.cameraId,
    );

    const markerExists = await this.redisService.exists(markerKey);
    if (markerExists) {
      await this.stopExistingSession(
        startSessionDto.adminId,
        startSessionDto.cameraId,
      );
    }

    const markerExistsAfterCheck = await this.redisService.exists(markerKey);
    if (!markerExistsAfterCheck) {
      await this.redisService.setex(
        markerKey,
        adminProfile.sessionDuration,
        '1',
      );

      // const newSession = await this.prisma.detectionSession.create({
      //   data: {
      //     cameraId: startSessionDto.cameraId,
      //   },
      // });
      console.log('markerExistsAfterCheck');

      return {
        cameraId: startSessionDto.cameraId,
        sessionDuration: `${adminProfile.sessionDuration}s`,
      };
    }
    console.log('last return');
    return {
      cameraId: startSessionDto.cameraId,
      sessionDuration: `${adminProfile.sessionDuration}s`,
    };
  }

  async endSession(sessionId: string): Promise<void> {
    const session = await this.prisma.detectionSession.findUnique({
      where: { id: sessionId },
    });

    if (session) {
      await this.prisma.detectionSession.update({
        where: { id: sessionId },
        data: {
          endedAt: new Date(),
        },
      });

      // ลบ Marker Key ที่เกี่ยวข้อง (ถ้ามี logic การใช้ Marker Key ต่อเนื่อง)
      const adminId = session.cameraId;
      const cameraId = session.cameraId;
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
}
