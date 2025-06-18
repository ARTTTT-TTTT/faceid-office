import { Position } from '@prisma/client';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class GetDetectionLogRequest {
  @IsNotEmpty()
  @IsBoolean()
  isUnknown: boolean;
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
