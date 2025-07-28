import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  // decorators here
  Transform,
  Type,
} from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { lowerCaseTransformer } from '../../../utils/transformers/lower-case.transformer';
import { StatusDto } from '../../statuses/dto/status.dto';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class CreateTagDto {
  @ApiProperty({ example: 'Tag Name', type: String })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'tag-name', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  slug: string;

  @ApiProperty({ example: 'Tag description', type: String })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: Number })
  @IsNotEmpty()
  @IsInt()
  status?: number;
}
