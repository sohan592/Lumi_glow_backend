import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CategoryDto } from '@src/modules/categories/dto/category.dto';
import { ProductOutputDto } from '@src/modules/products/dto/product.dto';
import { StatusDto } from '@src/modules/statuses/dto/status.dto';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DiscountType } from '../entity/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({ example: 'Summer Sale 2024' })
  @IsNotEmpty()
  campaignName: string;

  @ApiProperty({ example: 'SUMMER24' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 10.0 })
  @IsNumber()
  discountValue: number;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date;

  @ApiProperty({ example: 100 })
  @IsNumber()
  maxUses: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  maxUsesPerUser: number;

  @ApiPropertyOptional({ example: 50.0 })
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 100.0 })
  @IsOptional()
  @IsNumber()
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  productIds?: number[];

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  categoryIds?: number[];

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  status: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class FilterCouponDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  campaignName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status?: StatusDto[];
}

export class SortCouponDto {
  @ApiProperty()
  @IsString()
  orderBy: keyof CreateCouponDto;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryCouponDto {
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
    value ? plainToInstance(FilterCouponDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterCouponDto)
  filters?: FilterCouponDto;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortCouponDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortCouponDto)
  sort?: SortCouponDto[];
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
