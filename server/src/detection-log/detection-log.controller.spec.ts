import { Test, TestingModule } from '@nestjs/testing';
import { DetectionLogController } from './detection-log.controller';
import { DetectionLogService } from './detection-log.service';

describe('DetectionLogController', () => {
  let controller: DetectionLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetectionLogController],
      providers: [DetectionLogService],
    }).compile();

    controller = module.get<DetectionLogController>(DetectionLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
