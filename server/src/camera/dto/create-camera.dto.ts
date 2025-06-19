import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCameraDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  location: string;
}
