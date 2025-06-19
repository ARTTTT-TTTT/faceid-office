import { Test, TestingModule } from '@nestjs/testing';

import { AiVectorService } from './ai-vector.service';

describe('AiVectorService', () => {
  let service: AiVectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiVectorService],
    }).compile();

    service = module.get<AiVectorService>(AiVectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
