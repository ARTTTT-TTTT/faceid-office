import { Test, TestingModule } from '@nestjs/testing';

import { DetectionSessionService } from './detection-session.service';

describe('DetectionSessionService', () => {
  let service: DetectionSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetectionSessionService],
    }).compile();

    service = module.get<DetectionSessionService>(DetectionSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
