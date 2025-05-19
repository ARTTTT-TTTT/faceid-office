import { IsOptional, IsString } from 'class-validator';

export class UpdateCameraDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
