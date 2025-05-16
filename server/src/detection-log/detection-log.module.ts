import { Module } from '@nestjs/common';
import { DetectionLogService } from './detection-log.service';
import { DetectionLogController } from './detection-log.controller';

@Module({
  controllers: [DetectionLogController],
  providers: [DetectionLogService],
})
export class DetectionLogModule {}
