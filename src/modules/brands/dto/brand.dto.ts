import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusDto } from '@src/modules/statuses/dto/status.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class BrandDto {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    type: String,
    example: 'Brand',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    example: 'Brand-slug',
  })
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    type: String,
    example: 'Brand description',
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
