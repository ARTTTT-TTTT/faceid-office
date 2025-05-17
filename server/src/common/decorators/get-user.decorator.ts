import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

export const GetUser = createParamDecorator(
  <T extends keyof JwtPayload | undefined>(
    data: T,
    ctx: ExecutionContext,
  ): T extends keyof JwtPayload ? JwtPayload[T] : JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;

    if (data) {
      return user[data] as T extends keyof JwtPayload
        ? JwtPayload[T]
        : JwtPayload;
    }

    return user as T extends keyof JwtPayload ? JwtPayload[T] : JwtPayload;
  },
);
