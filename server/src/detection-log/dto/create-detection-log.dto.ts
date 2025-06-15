import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateDetectionLogDto {
  @IsNotEmpty()
  @IsUUID()
  adminId: string;

  @IsNotEmpty()
  @IsBoolean()
  isUnknown: boolean;

  @IsNotEmpty()
  @IsUUID()
  cameraId: string;

  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @IsNotEmpty()
  @IsUUID()
  personId: string;
}
