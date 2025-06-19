import { Injectable, NotFoundException } from '@nestjs/common';

import { CameraResponseDto } from '@/camera/dto/camera-response.dto';
import { CreateCameraDto } from '@/camera/dto/create-camera.dto';
import { UpdateCameraDto } from '@/camera/dto/update-camera.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CameraService {
  constructor(private prisma: PrismaService) {}

  // * ========== CORE ===========

  async createCamera(
    adminId: string,
    dto: CreateCameraDto,
  ): Promise<CameraResponseDto> {
    const camera = await this.prisma.camera.create({
      data: {
        name: dto.name,
        location: dto.location,
        admin: {
          connect: { id: adminId },
        },
      },
    });

    return {
      id: camera.id,
      name: camera.name,
      location: camera.location,
    };
  }

  async updateCamera(
    cameraId: string,
    dto: UpdateCameraDto,
  ): Promise<CameraResponseDto> {
    const camera = await this.prisma.camera.update({
      where: { id: cameraId },
      data: dto,
    });

    return {
      id: camera.id,
      name: camera.name,
      location: camera.location,
    };
  }

  async getCameras(adminId: string): Promise<CameraResponseDto[]> {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!existingAdmin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    const cameras = await this.prisma.camera.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
    });

    return cameras.map(({ id, name, location }) => ({
      id,
      name,
      location,
    }));
  }

  // * ========== OTHER ===========

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

    const { id, name, location } = camera;
    return { id, name, location };
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
