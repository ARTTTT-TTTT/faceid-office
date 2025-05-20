import { Module } from '@nestjs/common';

import { DetectionSessionController } from './detection-session.controller';
import { DetectionSessionService } from './detection-session.service';

@Module({
  exports: [DetectionSessionService],
  controllers: [DetectionSessionController],
  providers: [DetectionSessionService],
})
export class DetectionSessionModule {}
