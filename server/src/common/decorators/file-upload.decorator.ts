import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

export function UploadImageFiles(fieldName: string = 'images', maxCount = 5) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, {
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
          fileSize: 1024 * 1024 * 5, // 5MB per file
        },
      }),
    ),
  );
}
