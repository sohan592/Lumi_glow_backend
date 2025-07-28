import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FileMetadataDto } from './uploadMedia.dto';

export class FilterMediaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mimeType?: string | null;
}

export class SortMediaDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof FileMetadataDto;

  @ApiProperty()
  @IsString()
  order: 'ASC' | 'DESC';
}

export class QueryMediaDto {
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
    value ? plainToInstance(FilterMediaDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterMediaDto)
  filters?: FilterMediaDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortMediaDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortMediaDto)
  sort?: SortMediaDto[] | null;
}
