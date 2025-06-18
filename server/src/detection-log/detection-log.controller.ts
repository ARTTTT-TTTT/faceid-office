import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { CheckOwnership } from '@/common/decorators/check-ownership.decorator';
import { UploadDetectionFile } from '@/common/decorators/file-upload.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { DetectionLogService } from '@/detection-log/detection-log.service';
import { CreateDetectionLogDto } from '@/detection-log/dto/create-detection-log.dto';
import { DetectionLogResponse } from '@/detection-log/dto/detection-log-response.dto';
import {
  GetDetectionLogRequest,
  GetDetectionPersonResponse,
  GetDetectionUnknownResponse,
} from '@/detection-log/dto/get-detection-log.dto';

@UseGuards(JwtAuthGuard)
@Controller('detection-log')
export class DetectionLogController {
  constructor(private readonly detectionLogService: DetectionLogService) {}

  // TODO: getDetectionLog (pagination)

  // * ========== CORE ===========

  @Post()
  @UploadDetectionFile()
  async createDetectionLog(
    @GetUser('sub') adminId: string,
    @Body() dto: CreateDetectionLogDto,
    @UploadedFile()
    detectionImage: Express.Multer.File,
  ) {
    if (!detectionImage) {
      throw new BadRequestException('Detection image file is required.');
    }
    return this.detectionLogService.createDetectionLog(
      dto,
      adminId,
      detectionImage,
    );
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

  @Post('latest/:limit') // Using POST as it receives a body and path params
  async getLatestFilteredLogs(
    @Param('limit', ParseIntPipe) limit: number, // Automatically parses 'limit' to an integer
    @Body() body: GetDetectionLogRequest,
  ): Promise<Array<GetDetectionPersonResponse | GetDetectionUnknownResponse>> {
    return this.detectionLogService.getLatestFilteredDetectionLogs(
      body.isUnknown,
      limit,
    );
  }
}
