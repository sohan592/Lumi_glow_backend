import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BrandService } from './brand.service';

import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '@utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '@utils/infinity-pagination';
import { NullableType } from '../../utils/types/nullable.type';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { BrandDto } from './dto/brand.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';

@ApiTags('Brand')
@Controller({
  path: 'Brand',
  version: '1',
})
export class BrandController {
  constructor(private readonly service: BrandService) {}

  //create Brand
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('create')
  @ApiOkResponse({
    type: BrandDto,
  })
  @HttpCode(HttpStatus.CREATED)
  public createBrand(@Body() createDto: CreateBrandDto): Promise<BrandDto> {
    return this.service.create(createDto);
  }

  //update Brand
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: BrandDto,
  })
  public update(
    @Param('id') id: BrandDto['id'],
    @Body() BrandDto: UpdateBrandDto,
  ): Promise<NullableType<BrandDto>> {
    console.log({
      id,
      BrandDto,
    });

    return this.service.update(id, BrandDto);
  }

  //get Brand by id

  // @ApiBearerAuth()
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SerializeOptions({
    groups: ['me'],
  })
  @Get(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: BrandDto,
  })
  public findOne(
    @Param('id') id: BrandDto['id'],
  ): Promise<NullableType<BrandDto>> {
    return this.service.findById(id);
  }

  //get all brands

  @ApiOkResponse({
    type: InfinityPaginationResponse(BrandDto),
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    type: String,
    example: '{"name":"Burger","status":[{"id":1}]}',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: '[{"orderBy":"name","order":"ASC"}]',
  })
  async findAll(
    @Query() query: QueryBrandDto,
  ): Promise<PaginationResponseDto<BrandDto>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const response = await this.service.findManyWithPagination({
      filterOptions: query?.filters,
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
      },
    });

    return {
      data: response.data,
      total: response.total,
      page,
      limit,
    };
  }

  //delete Brand
  // @ApiBearerAuth()
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of Brand IDs',
    example: [1, 2, 3],
    required: true,
  })
  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Query('ids') ids: number[]): Promise<void> {
    return this.service.softDelete(ids);
  }

  //status update
  // @ApiBearerAuth()
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of Brand IDs',
    example: [1, 2, 3],
    required: true,
  })
  @ApiQuery({
    name: 'status',
    type: 'number',
    required: true,
  })
  @Patch('status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Query('ids') ids: number[],
    @Query('status') status: number,
  ): Promise<void> {
    return this.service.updateStatus(ids, status);
  }
}
