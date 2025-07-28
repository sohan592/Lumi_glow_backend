import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { StatusDto } from '@src/modules/statuses/dto/status.dto';
import { CategoryDto } from './category.dto';

export class FilterCategoryDto {
  @ApiPropertyOptional({ type: StatusDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status?: StatusDto[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string | null;
}

export class SortCategoryDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof CategoryDto;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryCategoryDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterCategoryDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterCategoryDto)
  filters?: FilterCategoryDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortCategoryDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortCategoryDto)
  sort?: SortCategoryDto[] | null;
}
