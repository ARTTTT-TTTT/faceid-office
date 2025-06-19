export enum Position {
  STUDENT = 'นักเรียน/นักศึกษา',
  MANAGER = 'ผู้จัดการ',
  EMPLOYEE = 'พนักงาน',
  OFFICER = 'เจ้าหน้าที่',
  GUEST = 'แขก',
}

export interface Person {
  adminId: string;
  createdAt: string;
  faceImagePaths: string[];
  fullName: string;
  id: string;
  position: Position;
  profileImagePath: string;
  updatedAt: string;
}

export interface CreatePersonPayload {
  profileImage: File;
  faceImages: File[];
  fullName: string;
  position: string;
}
