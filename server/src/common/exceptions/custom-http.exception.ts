import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    message: string,
    code: string,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super({ message, code }, status);
  }
}
