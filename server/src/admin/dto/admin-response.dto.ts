import { CameraResponseDto } from '@/camera/dto/camera-response.dto';

export interface Person {
  id: string;
  fullName: string;
}

export interface AdminProfile {
  name: string;
  email: string;
  sessionDuration: number;
  cameras?: CameraResponseDto[];
  people?: Person[];
}

export interface AdminSettingsResponseDto {
  sessionDuration: number;
  cameras?: CameraResponseDto[];
}
