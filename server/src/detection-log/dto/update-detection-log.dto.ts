import { PartialType } from '@nestjs/swagger';
import { CreateDetectionLogDto } from './create-detection-log.dto';

export class UpdateDetectionLogDto extends PartialType(CreateDetectionLogDto) {}
