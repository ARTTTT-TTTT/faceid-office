import { PartialType } from '@nestjs/swagger';
import { CreateFacedatumDto } from './create-facedatum.dto';

export class UpdateFacedatumDto extends PartialType(CreateFacedatumDto) {}
