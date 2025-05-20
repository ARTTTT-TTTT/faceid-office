export interface ResultEntry {
  cameraId: string;
  TTL: string;
}

export interface FailedCamera {
  cameraId: string;
  markerKey: string;
}

export interface HandleCameraResult {
  cameraId: string;
  TTL: string;
  success: boolean;
  markerKey: string;
}

export interface RetryResult {
  results: ResultEntry[];
  createdKeys: string[];
}

export interface SessionSummary {
  success: boolean;
  totalExpected: number;
  totalCreated: number;
  failed: number;
}

export interface StartSessionResult {
  results: ResultEntry[];
  summary: SessionSummary;
}

export interface SessionStatus {
  cameraId: string;
  status: 'start' | 'end';
  TTL: number | null;
}
