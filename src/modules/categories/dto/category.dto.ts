import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusDto } from '@src/modules/statuses/dto/status.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CategoryDto {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    type: String,
    example: 'category',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    example: 'category-slug',
  })
  @IsOptional()
  slug: string;

  @ApiProperty({
    type: String,
    example: 'Category description',
    required: false,
    nullable: true,
  })
  description?: string;

  @ApiPropertyOptional({ type: StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;
}
