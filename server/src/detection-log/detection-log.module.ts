import { Module } from '@nestjs/common';

import { DetectionLogController } from '@/detection-log/detection-log.controller';
import { DetectionLogService } from '@/detection-log/detection-log.service';

@Module({
  controllers: [DetectionLogController],
  providers: [DetectionLogService],
})
export class DetectionLogModule {}
