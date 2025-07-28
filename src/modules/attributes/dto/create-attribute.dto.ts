import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  // decorators here
  Transform,
  Type,
} from 'class-transformer';
import {
  ArrayNotEmpty,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { lowerCaseTransformer } from '../../../utils/transformers/lower-case.transformer';
import { StatusDto } from '../../statuses/dto/status.dto';

export class CreateAttributeValueDto {
  @ApiProperty({
    type: String,
    example: 'Red',
  })
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class CreateAttributeDto {
  @ApiProperty({
    type: String,
    example: 'attribute',
  })
  @IsNotEmpty()
  internalName: string;

  @ApiProperty({
    type: String,
    example: 'Attribute',
  })
  @IsNotEmpty()
  externalName: string;

  @ApiProperty({
    type: String,
    enum: ['select', 'checkbox', 'radio', 'string'],
    example: 'select',
  })
  @IsNotEmpty()
  type: 'select' | 'checkbox' | 'radio' | 'string';

  @ApiProperty({
    type: [CreateAttributeValueDto],
    example: [{ value: 'Red' }, { value: 'Blue' }],
  })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeValueDto)
  values: CreateAttributeValueDto[];

  @ApiProperty({
    type: String,
    example: 'Attribute description',
    required: false,
    nullable: true,
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  status?: number;
}
