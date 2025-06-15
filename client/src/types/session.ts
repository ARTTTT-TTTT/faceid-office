export enum SessionStatus {
  START = 'start',
  END = 'end',
}

export interface CameraSession {
  cameraId: string;
  TTL: number;
  markerKey: string;
}

export interface Session {
  sessionId: string;
  cameras: CameraSession[];
  status: SessionStatus;
}
