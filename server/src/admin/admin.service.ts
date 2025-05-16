import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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
