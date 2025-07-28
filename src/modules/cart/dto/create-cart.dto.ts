import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';

export class SelectedAttributeDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  attributeId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  valueId: number;

  @ApiProperty({ example: 'Red' })
  @IsOptional()
  value?: string;
}

export class CreateCartDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ type: [SelectedAttributeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedAttributeDto)
  selectedAttributes?: SelectedAttributeDto[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isWishlist?: boolean;
}
