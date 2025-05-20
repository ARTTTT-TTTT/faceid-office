import { PartialType } from '@nestjs/swagger';

import { CreateDetectionSessionDto } from './create-detection-session.dto';

export class UpdateDetectionSessionDto extends PartialType(
  CreateDetectionSessionDto,
) {}
