import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}
