import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusDto } from '@src/modules/statuses/dto/status.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class TagDto {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    type: String,
    example: 'tag',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    example: 'tag-slug',
  })
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    type: String,
    example: 'Tag description',
    required: false,
    nullable: true,
  })
  description?: string;

  @ApiPropertyOptional({ type: StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;

  //isCondition
  @ApiProperty({
    type: Boolean,
    example: false,
  })
  @IsOptional()
  isCondition: boolean;
}
