import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductOutputDto } from '@src/modules/products/dto/product.dto';

export class SelectedAttributeOutputDto {
  @ApiProperty({ example: 1 })
  attributeId: number;

  @ApiProperty({ example: 'Color' })
  attributeName: string;

  @ApiProperty({ example: 1 })
  valueId: number;

  @ApiProperty({ example: 'Red' })
  value: string;
}

export class CartOutputDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: () => ProductOutputDto })
  product: ProductOutputDto;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 99.99 })
  price: number;

  @ApiProperty({ example: 199.98 })
  total: number;

  @ApiPropertyOptional({ type: [SelectedAttributeOutputDto] })
  selectedAttributes?: SelectedAttributeOutputDto[];

  @ApiProperty({ example: false })
  isWishlist: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;
}
