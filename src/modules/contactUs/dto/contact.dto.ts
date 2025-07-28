import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusDto } from '@src/modules/statuses/dto/status.dto';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEmail,
  ValidateNested,
} from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Product Inquiry' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: 'I have a question about...' })
  @IsNotEmpty()
  @IsString()
  message: string;
}

export class ContactOutputDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  reply?: string;

  @ApiProperty()
  status: StatusDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UpdateContactDto {
  @ApiProperty({ example: 'Thank you for your inquiry...' })
  @IsNotEmpty()
  @IsString()
  reply: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  status: number;
}

export class FilterContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status?: StatusDto[];
}

export class SortContactDto {
  @ApiProperty()
  @IsString()
  orderBy: keyof ContactOutputDto;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryContactDto {
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
    value ? plainToInstance(FilterContactDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterContactDto)
  filters?: FilterContactDto;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortContactDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortContactDto)
  sort?: SortContactDto[];
}
