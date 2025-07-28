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
  Request,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AttributeService } from './attribute.service';

import { AuthGuard } from '@nestjs/passport';
import { NullableType } from '../../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { AttributeDto } from './dto/attribute.dto';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '@utils/dto/infinity-pagination-response.dto';
import { QueryAttributeDto } from './dto/query-attribute.dto';
import { infinityPagination } from '@utils/infinity-pagination';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';

@ApiTags('Attribute')
@Controller({
  path: 'attribute',
  version: '1',
})
export class AttributeController {
  constructor(private readonly service: AttributeService) {}

  //create attribute
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('create')
  @ApiOkResponse({
    type: AttributeDto,
  })
  @HttpCode(HttpStatus.CREATED)
  public createAttribute(
    @Body() createDto: CreateAttributeDto,
  ): Promise<AttributeDto> {
    return this.service.create(createDto);
  }

  //update attribute
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
    type: AttributeDto,
  })
  public update(
    @Param('id') id: AttributeDto['id'],
    @Body() attributeDto: UpdateAttributeDto,
  ): Promise<NullableType<AttributeDto>> {
    console.log({
      id,
      attributeDto,
    });

    return this.service.update(id, attributeDto);
  }

  //get attribute by id

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
    type: AttributeDto,
  })
  public findOne(
    @Param('id') id: AttributeDto['id'],
  ): Promise<NullableType<AttributeDto>> {
    return this.service.findById(id);
  }

  //get all attributes

  @ApiOkResponse({
    type: InfinityPaginationResponse(AttributeDto),
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
    example: '{"internalName":"Burger","status":[{"id":1}]}',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: '[{"orderBy":"internalName","order":"ASC"}]',
  })
  async findAll(
    @Query() query: QueryAttributeDto,
  ): Promise<PaginationResponseDto<AttributeDto>> {
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
      page: page,
      limit: limit,
    };
  }

  //delete attribute
  // @ApiBearerAuth()
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of attribute IDs',
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
    description: 'Array of attribute IDs',
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
