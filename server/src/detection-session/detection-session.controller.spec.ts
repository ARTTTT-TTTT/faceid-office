import { Test, TestingModule } from '@nestjs/testing';

import { DetectionSessionController } from './detection-session.controller';
import { DetectionSessionService } from './detection-session.service';

describe('DetectionSessionController', () => {
  let controller: DetectionSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetectionSessionController],
      providers: [DetectionSessionService],
    }).compile();

    controller = module.get<DetectionSessionController>(
      DetectionSessionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
