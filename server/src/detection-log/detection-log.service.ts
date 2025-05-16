import { Injectable } from '@nestjs/common';
import { CreateDetectionLogDto } from './dto/create-detection-log.dto';
import { UpdateDetectionLogDto } from './dto/update-detection-log.dto';

@Injectable()
export class DetectionLogService {
  create(createDetectionLogDto: CreateDetectionLogDto) {
    // Example usage to avoid unused parameter error
    return `This action adds a new detectionLog with data: ${JSON.stringify(createDetectionLogDto)}`;
  }

  findAll() {
    return `This action returns all detectionLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detectionLog`;
  }

  update(id: number, updateDetectionLogDto: UpdateDetectionLogDto) {
    // Example usage to avoid unused parameter error
    return `This action updates a #${id} detectionLog with data: ${JSON.stringify(updateDetectionLogDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} detectionLog`;
  }
}
