import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CameraService } from './camera.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
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

  @Get(':id')
  async getOneCamera(
    @GetUser('sub') adminId: string,
    @Param('id') cameraId: string,
  ) {
    return this.cameraService.getOneCamera(adminId, cameraId);
  }
}
