import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

import { RoleDto } from '../../roles/dto/role.dto';
import { User } from '@src/modules/users/domain/user';
import { StatusDto } from '@src/modules/statuses/dto/status.dto';
import { BrandDto } from './brand.dto';

export class FilterBrandDto {
  @ApiPropertyOptional({ type: RoleDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status?: StatusDto[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string | null;
}

export class SortBrandDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof BrandDto;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryBrandDto {
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
    value ? plainToInstance(FilterBrandDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterBrandDto)
  filters?: FilterBrandDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortBrandDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortBrandDto)
  sort?: SortBrandDto[] | null;
}
