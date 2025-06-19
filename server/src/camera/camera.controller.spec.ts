import { Test, TestingModule } from '@nestjs/testing';

import { CameraController } from '@/camera/camera.controller';
import { CameraService } from '@/camera/camera.service';

describe('CameraController', () => {
  let controller: CameraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CameraController],
      providers: [CameraService],
    }).compile();

    controller = module.get<CameraController>(CameraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
