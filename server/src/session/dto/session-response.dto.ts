import { CameraResultEntry, SessionStatus } from '@/session/session.interface';

export interface SessionStatusResponseDto {
  sessionId: string;
  cameras: CameraResultEntry[];
  status: SessionStatus;
}
