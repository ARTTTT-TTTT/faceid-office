import { Controller } from '@nestjs/common';

import { DetectionSessionService } from './detection-session.service';

@Controller('detection-session')
export class DetectionSessionController {
  constructor(
    private readonly detectionSessionService: DetectionSessionService,
  ) {}
}
