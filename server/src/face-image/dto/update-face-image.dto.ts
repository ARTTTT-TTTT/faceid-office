import { PartialType } from '@nestjs/swagger';
import { CreateFaceImageDto } from './create-face-image.dto';

export class UpdateFaceImageDto extends PartialType(CreateFaceImageDto) {}
