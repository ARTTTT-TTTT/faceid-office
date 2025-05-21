import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { CameraResponseDto } from './dto/camera-response.dto';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';

@Injectable()
export class CameraService {
  constructor(private prisma: PrismaService) {}

  async createCamera(
    adminId: string,
    dto: CreateCameraDto,
  ): Promise<CameraResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) throw new NotFoundException('Admin not found');

    const camera = await this.prisma.camera.create({
      data: {
        name: dto.name,
        location: dto.location,
        adminId,
      },
    });
    return {
      id: camera.id,
      name: camera.name,
      location: camera.location,
      createdAt: camera.createdAt,
    };
  }

  async getCameras(adminId: string): Promise<CameraResponseDto[]> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const cameras = await this.prisma.camera.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
    });

    return cameras.map(({ id, name, location, createdAt }) => ({
      id,
      name,
      location,
      createdAt,
    }));
  }

  async getOneCamera(
    adminId: string,
    cameraId: string,
  ): Promise<CameraResponseDto> {
    const camera = await this.prisma.camera.findFirst({
      where: {
        id: cameraId,
        adminId,
      },
    });

    if (!camera) {
      throw new NotFoundException('Camera not found');
    }

    const { id, name, location, createdAt } = camera;
    return { id, name, location, createdAt };
  }

  async updateCamera(cameraId: string, dto: UpdateCameraDto) {
    const existing = await this.prisma.camera.findUnique({
      where: { id: cameraId },
    });
    if (!existing) throw new NotFoundException('Camera not found');

    return this.prisma.camera.update({
      where: { id: cameraId },
      data: dto,
    });
  }

  // !FEATURE: Delete camera but still keep the logs
  async delete(cameraId: string) {
    const camera = await this.prisma.camera.findUnique({
      where: { id: cameraId },
    });
    if (!camera) {
      throw new NotFoundException('Camera not found');
    }

    await this.prisma.camera.delete({ where: { id: cameraId } });
    return { message: 'Camera deleted successfully' };
  }
}
