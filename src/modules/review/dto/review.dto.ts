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

export class CreateReviewDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  status: number;
}

export class CreateUserReviewDto {
  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class reviewOutputDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  comment?: string;

  @ApiProperty()
  adminReply?: string;

  @ApiProperty()
  status: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FilterReviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status?: StatusDto[];
}

export class SortReviewDto {
  @ApiProperty()
  @IsString()
  orderBy: keyof reviewOutputDto;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryReviewDto {
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
    value ? plainToInstance(FilterReviewDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterReviewDto)
  filters?: FilterReviewDto;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortReviewDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortReviewDto)
  sort?: SortReviewDto[];
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminReply?: string;
}

export class UpdateUserReviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
