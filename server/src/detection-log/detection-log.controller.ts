import { Body, Controller } from '@nestjs/common';

import { DetectionLogService } from './detection-log.service';

@Controller('detection-log')
export class DetectionLogController {
  constructor(private readonly detectionLogService: DetectionLogService) {}
}
