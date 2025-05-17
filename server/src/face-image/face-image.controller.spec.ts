import { Test, TestingModule } from '@nestjs/testing';

import { FaceImageController } from './face-image.controller';
import { FaceImageService } from './face-image.service';

describe('FaceImageController', () => {
  let controller: FaceImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaceImageController],
      providers: [FaceImageService],
    }).compile();

    controller = module.get<FaceImageController>(FaceImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
