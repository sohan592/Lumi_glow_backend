import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { AddressType } from '../entity/address.entity';

export class CreateAddressDto {
  @ApiProperty({ enum: AddressType, example: AddressType.HOME })
  @IsNotEmpty()
  @IsEnum(AddressType)
  type: AddressType;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'example@mail.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Apartment 4B' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'New York' })
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiPropertyOptional({ example: 'Near Park' })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefaultShipping?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefaultBilling?: boolean;

  @ApiPropertyOptional({ example: 'Leave at the reception' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddressDto extends CreateAddressDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2023-10-16T08:45:30.123Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-10-16T08:45:30.123Z' })
  updatedAt: Date;
}
