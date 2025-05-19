import { Body, Controller, Delete, Get, Param } from '@nestjs/common';

import { FaceImageService } from '@/face-image/face-image.service';

@Controller('face-images')
export class FaceImageController {
  constructor(private readonly faceImageService: FaceImageService) {}

  @Get(':personId')
  async getFaceImages(@Param('personId') personId: string) {
    return await this.faceImageService.getFaceImages(personId);
  }

  @Delete(':faceImageId')
  async deleteFaceImage(@Param('faceImageId') faceImageId: string) {
    return await this.faceImageService.deleteFaceImage(faceImageId);
  }
}
