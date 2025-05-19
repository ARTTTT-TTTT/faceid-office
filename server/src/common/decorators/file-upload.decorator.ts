import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

export function UploadImageFile(fieldName: string = 'image') {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        fileFilter: (_req, file, callback) => {
          if (!['image/jpeg'].includes(file.mimetype)) {
            return callback(
              new BadRequestException('Only JPG files are allowed!'),
              false,
            );
          }
          callback(null, true);
        },
        limits: {
          fileSize: 1024 * 1024 * 5, // 5MB
        },
      }),
    ),
  );
}
