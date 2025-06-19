export enum SessionStatus {
  START = 'start',
  END = 'end',
}

export interface CameraResultEntry {
  cameraId: string;
  TTL: number;
  markerKey: string;
}
