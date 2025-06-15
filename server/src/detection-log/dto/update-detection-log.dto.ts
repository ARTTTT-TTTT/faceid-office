import { PartialType } from '@nestjs/swagger';

import { CreateDetectionLogDto } from '@/detection-log/dto/create-detection-log.dto';

export class UpdateDetectionLogDto extends PartialType(CreateDetectionLogDto) {}
