import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  hasNext?: boolean;
}

export function PaginationResponse<T>(classReference: Type<T>) {
  abstract class Pagination {
    @ApiProperty({ type: [classReference] })
    data!: T[];

    @ApiProperty({
      type: Number,
      example: 100,
    })
    total: number;

    @ApiProperty({
      type: Number,
      example: 1,
    })
    page: number;

    @ApiProperty({
      type: Number,
      example: 10,
    })
    limit: number;
  }

  Object.defineProperty(Pagination, 'name', {
    writable: false,
    value: `InfinityPagination${classReference.name}ResponseDto`,
  });

  return Pagination;
}
