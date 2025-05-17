import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { CheckOwnership } from '@/common/decorators/check-ownership.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';

import { CameraService } from './camera.service';
import { CreateCameraDto } from './dto/create-camera.dto';
@UseGuards(JwtAuthGuard)
@Controller('camera')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  @Post()
  async createCamera(
    @GetUser('sub') adminId: string,
    @Body() dto: CreateCameraDto,
  ) {
    return this.cameraService.createCamera(adminId, dto);
  }

  @Get()
  async getCameras(@GetUser('sub') adminId: string) {
    return this.cameraService.getCameras(adminId);
  }

  @CheckOwnership('camera', 'cameraId')
  @Get(':cameraId')
  async getOneCamera(
    @GetUser('sub') adminId: string,
    @Param('cameraId') cameraId: string,
  ) {
    return this.cameraService.getOneCamera(adminId, cameraId);
  }
}
