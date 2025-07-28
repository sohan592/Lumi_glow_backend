import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaceAnalysisService } from './face-analysis.service';
import { FaceAnalysisController } from './face-analysis.controller';
import { FaceAnalysisLog } from './entities/face-analysis.entity';
import { ProductEntity } from '../products/entity/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FaceAnalysisLog, ProductEntity])],
  controllers: [FaceAnalysisController],
  providers: [FaceAnalysisService],
  exports: [FaceAnalysisService],
})
export class FaceAnalysisModule {}
