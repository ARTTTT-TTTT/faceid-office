import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { CheckOwnership } from '@/common/decorators/check-ownership.decorator';
import { UploadDetectionFiles } from '@/common/decorators/file-upload.decorator';
import { DetectionLogService } from '@/detection-log/detection-log.service';
import { CreateDetectionLogDto } from '@/detection-log/dto/create-detection-log.dto';
import { DetectionLogResponse } from '@/detection-log/dto/detection-log-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('detection-log')
export class DetectionLogController {
  constructor(private readonly detectionLogService: DetectionLogService) {}

  // TODO: getDetectionLog (pagination)

  // * ========== CORE ===========

  @Post()
  @UploadDetectionFiles(1)
  async createDetectionLog(
    @Body() dto: CreateDetectionLogDto,
    @UploadedFiles()
    detectionImage: Express.Multer.File,
  ) {
    return this.detectionLogService.createDetectionLog(dto, detectionImage);
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
