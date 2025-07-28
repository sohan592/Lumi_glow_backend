import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { StockStatus } from '../entity/product.entity';
import { JoinColumn, ManyToOne } from 'typeorm';
import { StatusEntity } from '@src/modules/statuses/entity/status.entity';
import { MediaEntity } from '@src/modules/media/entity/file.entity';

export class BrandDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'Apple' })
  @IsNotEmpty()
  name: string;
}

export class CategoryDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'Electronics' })
  @IsNotEmpty()
  name: string;
}

export class TagDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: '5G' })
  @IsNotEmpty()
  name: string;
}

export class AttributeDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'Storage' })
  @IsNotEmpty()
  internalName: string;
}

export class ProductImageDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: '/images/product.jpg' })
  @IsNotEmpty()
  imageUrl: string;
}

export class ProductOutputDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'iPhone 14 Pro' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'IPH14P-256-BLK' })
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: '123456789' })
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({ type: () => CategoryDto })
  @Type(() => CategoryDto)
  @IsNotEmpty()
  category: CategoryDto;

  @ApiPropertyOptional({ type: () => BrandDto })
  @Type(() => BrandDto)
  @IsOptional()
  brand?: BrandDto;

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

  @ApiPropertyOptional({ type: () => MediaEntity })
  @Type(() => MediaEntity)
  @IsOptional()
  featureImage?: MediaEntity;

  @ApiPropertyOptional({ type: () => [MediaEntity] })
  @Type(() => MediaEntity)
  @IsOptional()
  galleryImages?: MediaEntity[];

  @ApiProperty({ type: [TagDto] })
  @Type(() => TagDto)
  tags: TagDto[];

  @ApiProperty({ type: [AttributeDto] })
  @Type(() => AttributeDto)
  attributes: AttributeDto[];

  @ApiPropertyOptional({
    example: [{ title: 'Display', description: '6.1-inch Super Retina XDR' }],
  })
  @IsOptional()
  highlights?: { title: string; description: string }[];

  @ApiPropertyOptional({ example: 'Product description' })
  @IsOptional()
  description?: string;

  @ManyToOne(() => StatusEntity)
  @JoinColumn()
  status: StatusEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
