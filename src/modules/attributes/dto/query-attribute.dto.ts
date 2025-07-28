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
import { AttributeDto } from './attribute.dto';

export class FilterAttributeDto {
  @ApiPropertyOptional({ type: RoleDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status?: StatusDto[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalName?: string | null;
}

export class SortAttributeDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof AttributeDto;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryAttributeDto {
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
    value ? plainToInstance(FilterAttributeDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterAttributeDto)
  filters?: FilterAttributeDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortAttributeDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortAttributeDto)
  sort?: SortAttributeDto[] | null;
}
