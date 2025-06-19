import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { UploadDetectionFile } from '@/common/decorators/file-upload.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { DetectionLogService } from '@/detection-log/detection-log.service';
import { CreateDetectionLogDto } from '@/detection-log/dto/create-detection-log.dto';
import {
  GetDetectionLogQueryDto,
  GetDetectionPersonResponse,
  GetDetectionUnknownResponse,
} from '@/detection-log/dto/get-detection-log.dto';

@UseGuards(JwtAuthGuard)
@Controller('detection-logs')
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

  // @CheckOwnership('session', 'sessionId', 'query')
  // @Get('latest')
  // async getLatestLogs(
  //   @Query('sessionId') sessionId: string,
  //   @Query('limit') limit: string,
  // ): Promise<DetectionLogResponse[]> {
  //   const parsedLimit = parseInt(limit, 10) || 5;
  //   return this.detectionLogService.getLatestDetectionLogs(
  //     sessionId,
  //     parsedLimit,
  //   );
  // }

  @Get('latest') // No path parameter for limit now
  async getLatestFilteredLogs(
    @Query() query: GetDetectionLogQueryDto, // Receive all query parameters as an instance of your DTO
  ): Promise<Array<GetDetectionPersonResponse | GetDetectionUnknownResponse>> {
    return this.detectionLogService.getLatestFilteredDetectionLogs(
      query.isUnknown,
      query.limit,
      query.sessionId,
      query.cameraId,
    );
  }
}
