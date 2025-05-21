import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';

import { DetectionLogService } from './detection-log.service';
import { CreateDetectionLogDto } from './dto/create-detection-log.dto';

@UseGuards(JwtAuthGuard)
@Controller('detection-log')
export class DetectionLogController {
  constructor(private readonly detectionLogService: DetectionLogService) {}

  // !FEATURE getDetectionLog (pagination)
  // !FEATURE createDetectionLog request from ai
  // !FEATURE getLastDetectionLog

  @Post()
  async createDetectionLog(@Body() dto: CreateDetectionLogDto) {
    return this.detectionLogService.createDetectionLog(dto);
  }
}
