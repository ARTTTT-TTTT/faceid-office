import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StartSessionDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  cameraId: string;
}
