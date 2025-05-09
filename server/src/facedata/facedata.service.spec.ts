import { Test, TestingModule } from '@nestjs/testing';
import { FacedataService } from './facedata.service';

describe('FacedataService', () => {
  let service: FacedataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacedataService],
    }).compile();

    service = module.get<FacedataService>(FacedataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
