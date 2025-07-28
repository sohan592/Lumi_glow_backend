import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { StockStatus } from '../entity/product.entity';
import { ProductOutputDto } from './product.dto';
import { StatusDto } from '@src/modules/statuses/dto/status.dto';

export class FilterProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcode?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { each: true })
  categoryId?: number[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { each: true })
  brandId?: number[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minPrice?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxPrice?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minStock?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxStock?: number | null;

  @ApiPropertyOptional({ enum: StockStatus, isArray: true })
  @IsOptional()
  @IsEnum(StockStatus, { each: true })
  stockStatus?: StockStatus[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { each: true })
  tagIds?: number[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { each: true })
  attributeIds?: number[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasDiscount?: boolean | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasGalleryImages?: boolean | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdFrom?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdTo?: string | null;

  @ApiPropertyOptional({ type: StatusDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status?: StatusDto[] | null;
}

export class SortProductDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof ProductOutputDto;

  @ApiProperty()
  @IsString()
  order: 'ASC' | 'DESC';
}

export class QueryProductDto {
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
    value ? plainToInstance(FilterProductDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterProductDto)
  filters?: FilterProductDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortProductDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortProductDto)
  sort?: SortProductDto[] | null;
}
