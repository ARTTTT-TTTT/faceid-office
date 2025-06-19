import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { JwtPayload } from '@/auth/auth.interface';

export const GetUser = createParamDecorator(
  <T extends keyof JwtPayload | undefined>(
    data: T,
    ctx: ExecutionContext,
  ): T extends keyof JwtPayload ? JwtPayload[T] : JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    //console.log('user', user);

    if (data) {
      return user[data] as T extends keyof JwtPayload
        ? JwtPayload[T]
        : JwtPayload;
    }

    return user as T extends keyof JwtPayload ? JwtPayload[T] : JwtPayload;
  },
);
