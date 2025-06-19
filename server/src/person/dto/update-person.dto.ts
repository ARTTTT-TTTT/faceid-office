import { IsOptional, IsString } from 'class-validator';

export class UpdatePersonDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  position?: string;
}
