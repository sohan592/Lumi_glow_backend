import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  // decorators here
  Transform,
} from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { lowerCaseTransformer } from '../../../utils/transformers/lower-case.transformer';

export class CreateBrandDto {
  @ApiProperty({ example: 'Brand Name', type: String })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Brand-name', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  slug: string;

  @ApiProperty({ example: 'Brand description', type: String })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: Number })
  @IsNotEmpty()
  @IsInt()
  status?: number;
}
