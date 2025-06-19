import { Position } from '@/types/person';

export interface LatestDetectionLogPayload {
  isUnknown: boolean;
  limit: number;
  sessionId: string;
  cameraId: string;
}

export interface DetectionPersonResponse {
  id: string;
  detectedAt: string;
  detectionImagePath: string;
  fullName: string;
  position: Position;
  profileImagePath: string;
}

export interface DetectionUnknownResponse {
  id: string;
  detectedAt: string;
  detectionImagePath: string;
}
