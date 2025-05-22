import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { CheckOwnership } from '@/common/decorators/check-ownership.decorator';

import { DetectionLogService } from './detection-log.service';
import { CreateDetectionLogDto } from './dto/create-detection-log.dto';
import { DetectionLogResponse } from './dto/detection-log-response.dto';

@Controller('detection-log')
export class DetectionLogController {
  constructor(private readonly detectionLogService: DetectionLogService) {}

  // !FEATURE getDetectionLog (pagination)

  @Post()
  async createDetectionLog(@Body() dto: CreateDetectionLogDto) {
    return this.detectionLogService.createDetectionLog(dto);
  }

  @CheckOwnership('session', 'sessionId', 'query')
  @Get('latest')
  async getLatestLogs(
    @Query('sessionId') sessionId: string,
    @Query('limit') limit: string,
  ): Promise<DetectionLogResponse[]> {
    const parsedLimit = parseInt(limit, 10) || 5;
    return this.detectionLogService.getLatestDetectionLogs(
      sessionId,
      parsedLimit,
    );
  }
}
