import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsString,
  IsArray,
  IsInt,
} from 'class-validator';
import { StockStatus } from '../entity/product.entity';
import { JoinColumn, ManyToOne } from 'typeorm';
import { StatusEntity } from '@src/modules/statuses/entity/status.entity';

class CreateHighlightDto {
  @ApiProperty({ example: 'Display' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '6.1-inch Super Retina XDR' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 14 Pro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'IPH14P-256-BLK' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  brandId?: number;

  @ApiProperty({ example: 999.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 899.99, minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPrice?: number;

  @ApiProperty({ example: 50, minimum: 0 })
  @IsNumber()
  @Min(0)
  totalStock: number;

  @ApiProperty({ enum: StockStatus, example: StockStatus.IN_STOCK })
  @IsEnum(StockStatus)
  stockStatus: StockStatus;

  @ApiProperty({ type: [String], example: ['image1.jpg', 'image2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImages: string[];

  @ApiPropertyOptional({ example: 'main-image.jpg' })
  @IsString()
  @IsOptional()
  featureImage?: string;

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds?: number[];

  @ApiProperty({ type: [Number], example: [1, 2] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  attributeIds: number[];

  @ApiPropertyOptional({ type: [CreateHighlightDto] })
  @IsOptional()
  @IsArray()
  @Type(() => CreateHighlightDto)
  highlights?: CreateHighlightDto[];

  @ApiPropertyOptional({ example: 'Detailed product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  status?: number;
}
