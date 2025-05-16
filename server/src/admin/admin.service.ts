import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminProfile } from './admin.interface';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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

    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async updateSessionDuration(adminId: string, sessionDuration: number) {
    console.log('Updating session duration for admin:', adminId);
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) throw new NotFoundException('Admin not found');

    return this.prisma.admin.update({
      where: { id: adminId },
      data: {
        sessionDuration,
      },
    });
  }
}
