interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface Me {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export type { LoginPayload, Me, RegisterPayload };
