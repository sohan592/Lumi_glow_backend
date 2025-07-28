import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  // decorators here
  Transform,
  Type,
} from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { lowerCaseTransformer } from '../../../utils/transformers/lower-case.transformer';
import { StatusDto } from '../../statuses/dto/status.dto';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Category Name', type: String })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'category-name', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Category description', type: String })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  status?: number;
}
