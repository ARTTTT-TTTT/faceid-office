export interface DetectionLogResponse {
  id: string;
  detectedAt: Date;
  detectionImagePath: string;
  camera: {
    id: string;
    name: string;
    location?: string;
  };
  person: {
    id: string;
    fullName: string;
    position: string;
    profileImageUrl?: string;
  };
}
