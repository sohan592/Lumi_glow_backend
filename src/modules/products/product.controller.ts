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
  Req,
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
import { ProductService } from './product.service';

import { AuthGuard } from '@nestjs/passport';
import { InfinityPaginationResponse } from '@utils/dto/infinity-pagination-response.dto';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';
import { NullableType } from '../../utils/types/nullable.type';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductOutputDto } from './dto/product.dto';
import { Request } from 'express';

@ApiTags('Product')
@Controller({
  path: 'product',
  version: '1',
})
export class ProductController {
  constructor(private readonly service: ProductService) {}

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: PaginationResponseDto<ProductOutputDto>,
  })
  @Get('frontend')
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
    name: 'categoryId',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'isDiscounted',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'excludeProductId',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'tagSlug',
    required: false,
    type: String,
  })
  async findManyForFrontend(
    @Query('categoryId') categoryId?: number,
    @Query('keyword') keyword?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isDiscounted') isDiscounted?: boolean,
    @Query('excludeProductId') excludeProductId?: number,
    @Query('tagSlug') tagSlug?: string,
  ): Promise<PaginationResponseDto<ProductOutputDto>> {
    const response = await this.service.findManyForFrontend({
      categoryId,
      keyword,
      paginationOptions: { page, limit },
      isDiscounted,
      excludeProductId,
      tagSlug,
    });

    const hasNext = page * limit < response.total;
    return {
      data: response.data,
      total: response.total,
      page,
      limit,
      hasNext,
    };
  }

  //create product
  // @ApiBearerAuth()
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('create')
  @ApiOkResponse({
    type: ProductOutputDto,
  })
  @HttpCode(HttpStatus.CREATED)
  public createProduct(
    @Body() createDto: CreateProductDto,
  ): Promise<ProductOutputDto> {
    return this.service.create(createDto);
  }

  //update product
  // @ApiBearerAuth()
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ProductOutputDto,
  })
  public update(
    @Param('id') id: ProductOutputDto['id'],
    @Body() productDto: UpdateProductDto,
  ): Promise<NullableType<ProductOutputDto>> {
    return this.service.update(id, productDto);
  }

  //get product by id
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  @SerializeOptions({
    groups: ['me'],
  })
  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ProductOutputDto,
  })
  public findOne(
    @Param('id') id: ProductOutputDto['id'],
  ): Promise<NullableType<ProductOutputDto>> {
    return this.service.findById(id, 1);
  }

  //get all products
  @ApiOkResponse({
    type: InfinityPaginationResponse(ProductOutputDto),
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
    example:
      '{"name":"Example Name","sku":"SKU123","barcode":"BAR456","categoryId":[1,2],"brandId":[3],"minPrice":100,"maxPrice":500,"minStock":5,"maxStock":50,"stockStatus":["in_stock","out_of_stock"],"tagIds":[10],"attributeIds":[11,12],"hasDiscount":true,"hasGalleryImages":false,"createdFrom":"2023-01-01","createdTo":"2023-06-30","status":[{"id":1}]}',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: '[{"orderBy":"name","order":"ASC"}]',
  })
  async findAll(
    @Query() query: QueryProductDto,
  ): Promise<PaginationResponseDto<ProductOutputDto>> {
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

    const hasNext = page * limit < response.total;
    return {
      data: response.data,
      total: response.total,
      page,
      limit,
      hasNext,
    };
  }

  //delete product
  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of product IDs',
    example: [1, 2, 3],
    required: true,
  })
  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Query('ids') ids: number[]): Promise<void> {
    return this.service.softDelete(ids);
  }

  //status update
  @ApiQuery({
    name: 'ids',
    type: 'number',
    items: {
      type: 'number',
    },
    description: 'Array of product IDs',
    example: ['uuid1', 'uuid2', 'uuid3'],
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
