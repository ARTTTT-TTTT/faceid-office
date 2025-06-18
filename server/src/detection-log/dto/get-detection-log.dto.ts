import { Position } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class GetDetectionLogQueryDto {
  @IsBoolean()
  @Transform(({ value }) => value === 'true') // Manually transform 'true'/'false' strings to boolean
  isUnknown: boolean;

  @IsInt()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  limit: number;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  cameraId: string;
}

export interface GetDetectionPersonResponse {
  id: string;
  detectedAt: string;
  detectionImagePath: string;
  fullName: string;
  position: Position;
  profileImagePath: string;
}

export interface GetDetectionUnknownResponse {
  id: string;
  detectedAt: string;
  detectionImagePath: string;
}
