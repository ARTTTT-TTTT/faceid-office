import { Module } from '@nestjs/common';

import { DetectionLogController } from './detection-log.controller';
import { DetectionLogService } from './detection-log.service';

@Module({
  controllers: [DetectionLogController],
  providers: [DetectionLogService],
})
export class DetectionLogModule {}
