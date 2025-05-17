import { Request } from 'express';
import { JwtPayload } from '@/auth/auth.interface';

export interface AuthRequest extends Request {
  params: Record<string, string | undefined>;
  body: Record<string, string | number | boolean | object | undefined>;
  query: Record<string, string | string[] | undefined>;
  user?: JwtPayload;
}
