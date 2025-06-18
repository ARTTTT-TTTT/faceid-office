import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';

export function UploadPersonFiles(maxFaceImages = 3) {
  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(
        [
          { name: 'profileImage', maxCount: 1 },
          { name: 'faceImages', maxCount: maxFaceImages },
        ],
        {
          fileFilter: (_req, file, callback) => {
            if (!['image/png'].includes(file.mimetype)) {
              return callback(
                new BadRequestException('Only PNG files are allowed!'),
                false,
              );
            }
            callback(null, true);
          },
          limits: {
            fileSize: 1024 * 1024 * 5, // 5MB
          },
        },
      ),
    ),
  );
}

export function UploadDetectionFile() {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor('detectionImage', {
        fileFilter: (_req, file, callback) => {
          if (!['image/png'].includes(file.mimetype)) {
            return callback(
              new BadRequestException('Only PNG files are allowed!'),
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
