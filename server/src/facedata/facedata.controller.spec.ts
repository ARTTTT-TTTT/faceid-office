import { Test, TestingModule } from '@nestjs/testing';
import { FacedataController } from './facedata.controller';
import { FacedataService } from './facedata.service';

describe('FacedataController', () => {
  let controller: FacedataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacedataController],
      providers: [FacedataService],
    }).compile();

    controller = module.get<FacedataController>(FacedataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
