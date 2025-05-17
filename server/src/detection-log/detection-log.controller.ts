import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { DetectionLogService } from './detection-log.service';
import { CreateDetectionLogDto } from './dto/create-detection-log.dto';
import { UpdateDetectionLogDto } from './dto/update-detection-log.dto';

@Controller('detection-log')
export class DetectionLogController {
  constructor(private readonly detectionLogService: DetectionLogService) {}

  @Post()
  create(@Body() createDetectionLogDto: CreateDetectionLogDto) {
    return this.detectionLogService.create(createDetectionLogDto);
  }

  @Get()
  findAll() {
    return this.detectionLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detectionLogService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDetectionLogDto: UpdateDetectionLogDto,
  ) {
    return this.detectionLogService.update(+id, updateDetectionLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detectionLogService.remove(+id);
  }
}
