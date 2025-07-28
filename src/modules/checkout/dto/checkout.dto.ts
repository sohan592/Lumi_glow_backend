import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  isString,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entity/checkout.entity';

export class CheckoutItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ type: 'array' })
  @IsOptional()
  @IsArray()
  selectedAttributes?: {
    attributeId: number;
    valueId: number;
    value: string;
  }[];
}

export class CreateCheckoutDto {
  @ApiProperty({ type: [CheckoutItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  billingAddressId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  shippingAddressId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  shippingMethodId: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCheckoutFromCartDto {
  @ApiProperty({ type: [Number], description: 'Array of cart item IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  cartIds: number[];

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  billingAddressId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  shippingAddressId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  shippingMethodId: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CheckoutOutputDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  userId: number;

  @ApiProperty({ type: [CheckoutItemDto] })
  items: CheckoutItemDto[];

  @ApiProperty()
  billingAddressId: number;

  @ApiProperty()
  shippingAddressId: number;

  @ApiProperty()
  shippingMethodId: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  shipping: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty()
  statusId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FilterCheckoutDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  paymentStartDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  paymentEndDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  productIds?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  statusId?: number;
}

export class SortCheckoutDto {
  @ApiProperty()
  @IsString()
  orderBy: keyof CheckoutOutputDto;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryCheckoutDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterCheckoutDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterCheckoutDto)
  filters?: FilterCheckoutDto;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortCheckoutDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortCheckoutDto)
  sort?: SortCheckoutDto[];
}

export class UpdateCheckoutDto extends PartialType(CreateCheckoutDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastStatusNote?: string;
}
