import { Test, TestingModule } from '@nestjs/testing';
import { FaceAnalysisController } from './face-analysis.controller';
import { FaceAnalysisService } from './face-analysis.service';

describe('FaceAnalysisController', () => {
  let controller: FaceAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaceAnalysisController],
      providers: [FaceAnalysisService],
    }).compile();

    controller = module.get<FaceAnalysisController>(FaceAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
