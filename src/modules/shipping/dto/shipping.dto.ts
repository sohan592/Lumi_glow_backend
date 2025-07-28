import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusDto } from '@src/modules/statuses/dto/status.dto';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateShippingDto {
  @ApiProperty({ example: 'express_shipping' })
  @IsNotEmpty()
  @IsString()
  internalName: string;

  @ApiProperty({ example: 'Express Shipping' })
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiProperty({ example: 15.99 })
  @IsNotEmpty()
  @IsNumber()
  charge: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  status: number;
}

export class FilterShippingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status?: StatusDto[];
}

export class SortShippingDto {
  @ApiProperty()
  @IsString()
  orderBy: keyof CreateShippingDto;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryShippingDto {
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
    value ? plainToInstance(FilterShippingDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterShippingDto)
  filters?: FilterShippingDto;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortShippingDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortShippingDto)
  sort?: SortShippingDto[];
}

export class UpdateShippingDto extends PartialType(CreateShippingDto) {}
