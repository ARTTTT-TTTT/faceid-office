import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDetectionLogDto {
  @IsNotEmpty()
  @IsUUID()
  cameraId: string;

  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @IsNotEmpty()
  @IsString()
  personId: string;
}
