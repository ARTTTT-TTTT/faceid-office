import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext): unknown => {
    const request: Request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  },
);
