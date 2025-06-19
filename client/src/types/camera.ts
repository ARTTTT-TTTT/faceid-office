export interface Camera {
  id: string;
  name: string;
  location?: string;
}

export interface CreateCameraPayload {
  name: string;
  location: string;
}
