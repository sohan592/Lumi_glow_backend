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
import { CategoryService } from './category.service';

import { AuthGuard } from '@nestjs/passport';
import { InfinityPaginationResponse } from '@utils/dto/infinity-pagination-response.dto';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';
import { NullableType } from '../../utils/types/nullable.type';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Category')
@Controller({
  path: 'category',
  version: '1',
})
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  //create category
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('create')
  @ApiOkResponse({
    type: CategoryDto,
  })
  @HttpCode(HttpStatus.CREATED)
  public createCategory(
    @Body() createDto: CreateCategoryDto,
  ): Promise<CategoryDto> {
    return this.service.create(createDto);
  }

  //update category
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
    type: CategoryDto,
  })
  public update(
    @Param('id') id: CategoryDto['id'],
    @Body() categoryDto: UpdateCategoryDto,
  ): Promise<NullableType<CategoryDto>> {
    if (id === 1) {
      throw new Error('Cannot update default category');
    }

    return this.service.update(id, categoryDto);
  }

  //get category by id

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
    type: CategoryDto,
  })
  public findOne(
    @Param('id') id: CategoryDto['id'],
  ): Promise<NullableType<CategoryDto>> {
    return this.service.findById(id);
  }

  //get all categories

  @ApiOkResponse({
    type: InfinityPaginationResponse(CategoryDto),
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
    @Query() query: QueryCategoryDto,
  ): Promise<PaginationResponseDto<CategoryDto>> {
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

  //delete category
  // @ApiBearerAuth()
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of category IDs',
    example: [1, 2, 3],
    required: true,
  })
  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Query('ids') ids: number[]): Promise<void> {
    if (ids.includes(1)) {
      ids = ids.filter((id) => id !== 1);
    }
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
    description: 'Array of category IDs',
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
    if (ids.includes(1)) {
      ids = ids.filter((id) => id !== 1);
    }
    return this.service.updateStatus(ids, status);
  }
}
