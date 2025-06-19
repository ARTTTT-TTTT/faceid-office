import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { CameraService } from '@/camera/camera.service';
import { CreateCameraDto } from '@/camera/dto/create-camera.dto';
import { UpdateCameraDto } from '@/camera/dto/update-camera.dto';
import { CheckOwnership } from '@/common/decorators/check-ownership.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
@UseGuards(JwtAuthGuard)
@Controller('cameras')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  // * ========== CORE ===========

  @Post()
  async createCamera(
    @GetUser('sub') adminId: string,
    @Body() dto: CreateCameraDto,
  ) {
    return this.cameraService.createCamera(adminId, dto);
  }

  @CheckOwnership('camera', 'cameraId')
  @Patch(':cameraId')
  async updateCamera(
    @Param('cameraId') cameraId: string,
    @Body() dto: UpdateCameraDto,
  ) {
    return this.cameraService.updateCamera(cameraId, dto);
  }

  // * ========== OTHER ===========

  @Get()
  async getCameras(@GetUser('sub') adminId: string) {
    return this.cameraService.getCameras(adminId);
  }

  @Get(':cameraId')
  async getOneCamera(
    @GetUser('sub') adminId: string,
    @Param('cameraId') cameraId: string,
  ) {
    return this.cameraService.getOneCamera(adminId, cameraId);
  }

  @CheckOwnership('camera', 'cameraId')
  @Delete(':cameraId')
  async deleteCamera(@Param('cameraId') cameraId: string) {
    return this.cameraService.delete(cameraId);
  }
}
