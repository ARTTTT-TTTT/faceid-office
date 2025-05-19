export interface Camera {
  id: string;
  name: string;
}

export interface Person {
  id: string;
  fullName: string;
}

export interface AdminProfile {
  name: string;
  email: string;
  sessionDuration: number;
  cameras?: Camera[];
  people?: Person[];
}
