import { IsNotEmpty, IsString } from 'class-validator';

// !FEATURE IsYouUUID

export class StartSessionDto {
  @IsNotEmpty()
  @IsString()
  adminId: string;

  @IsNotEmpty()
  @IsString()
  cameraId: string;
}
