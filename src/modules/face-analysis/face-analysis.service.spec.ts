import { Test, TestingModule } from '@nestjs/testing';
import { FaceAnalysisService } from './face-analysis.service';

describe('FaceAnalysisService', () => {
  let service: FaceAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaceAnalysisService],
    }).compile();

    service = module.get<FaceAnalysisService>(FaceAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
