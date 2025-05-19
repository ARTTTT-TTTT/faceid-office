import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadFaceImageDto } from '@/face-image/dto/upload-face-image.dto';
import { FaceImageService } from '@/face-image/face-image.service';

@Controller('face-images')
export class FaceImageController {
  constructor(private readonly faceImageService: FaceImageService) {}

  @Get(':personId')
  async getFaceImages(@Param('personId') personId: string) {
    return await this.faceImageService.getFaceImages(personId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'image/jpeg') {
          return callback(
            new BadRequestException('Only JPG files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  )
  async uploadFaceImage(
    @Body() uploadFaceImageDto: UploadFaceImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.faceImageService.uploadFaceImage(
      file,
      uploadFaceImageDto,
    );
  }

  @Delete(':faceImageId')
  async deleteFaceImage(@Param('faceImageId') faceImageId: string) {
    return await this.faceImageService.deleteFaceImage(faceImageId);
  }
}
