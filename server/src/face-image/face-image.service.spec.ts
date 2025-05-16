import { Test, TestingModule } from '@nestjs/testing';
import { FaceImageService } from './face-image.service';

describe('FaceImageService', () => {
  let service: FaceImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaceImageService],
    }).compile();

    service = module.get<FaceImageService>(FaceImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
