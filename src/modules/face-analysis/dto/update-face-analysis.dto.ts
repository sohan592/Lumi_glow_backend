import { PartialType } from '@nestjs/swagger';
import { CreateFaceAnalysisDto } from './create-face-analysis.dto';

export class UpdateFaceAnalysisDto extends PartialType(CreateFaceAnalysisDto) {}
