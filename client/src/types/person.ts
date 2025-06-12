export enum Position {
  STUDENT,
  MANAGER,
  EMPLOYEE,
  OFFICER,
  GUEST,
}

export interface Person {
  adminId: string;
  createdAt: string;
  faceImagePaths: string[];
  fullName: string;
  id: string;
  position: Position;
  profileImagePath: Position;
  updatedAt: Position;
}

export interface CreatePersonPayload {
  profileImage: File;
  faceImages: File[];
  fullName: string;
  position: string;
}
