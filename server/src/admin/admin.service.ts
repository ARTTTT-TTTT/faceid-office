import { Injectable, NotFoundException } from '@nestjs/common';

import {
  AdminProfile,
  AdminSettingsResponseDto,
} from '@/admin/dto/admin-response.dto';
import { UpdateSessionDurationDto } from '@/admin/dto/update-session-duration.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // * ========== CORE ===========

  async getSettings(adminId: string): Promise<AdminSettingsResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        sessionDuration: true,
        cameras: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    return admin;
  }

  async updateSessionDuration(adminId: string, dto: UpdateSessionDurationDto) {
    const admin = await this.prisma.admin.update({
      where: { id: adminId },
      data: dto,
    });

    return {
      sessionDuration: admin.sessionDuration,
    };
  }

  async getSessionDuration(adminId: string): Promise<number> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        sessionDuration: true,
      },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }
    return admin.sessionDuration;
  }

  // * ========== OTHER ===========

  async getProfile(adminId: string): Promise<AdminProfile> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        name: true,
        email: true,
        sessionDuration: true,
        cameras: {
          select: {
            id: true,
            name: true,
          },
        },
        people: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }
    return admin;
  }
}
