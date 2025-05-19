import { Body, Controller } from '@nestjs/common';

import { FaceImageService } from '@/face-image/face-image.service';

@Controller('face-images')
export class FaceImageController {
  constructor(private readonly faceImageService: FaceImageService) {}
}
