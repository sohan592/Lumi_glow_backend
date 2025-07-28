import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusDto } from '@src/modules/statuses/dto/status.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CreateAttributeValueDto } from './create-attribute.dto';

export class AttributeDto {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  id: number;

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
  @IsOptional()
  @Type(() => CreateAttributeValueDto)
  values: CreateAttributeValueDto[];

  @ApiProperty({
    type: String,
    example: 'Attribute description',
    required: false,
    nullable: true,
  })
  description?: string;

  @ApiPropertyOptional({ type: StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;

  @ApiProperty({
    type: Date,
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
