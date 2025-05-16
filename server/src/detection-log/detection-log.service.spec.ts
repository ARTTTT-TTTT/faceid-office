import { Test, TestingModule } from '@nestjs/testing';
import { DetectionLogService } from './detection-log.service';

describe('DetectionLogService', () => {
  let service: DetectionLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetectionLogService],
    }).compile();

    service = module.get<DetectionLogService>(DetectionLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
