import { Camera } from '@/types/camera';

export interface AdminSettings {
  sessionDuration: number;
  cameras: Camera[];
}

export interface updateSessionDurationPayload {
  sessionDuration: number;
}
