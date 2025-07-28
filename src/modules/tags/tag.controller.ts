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
import { TagService } from './tag.service';

import { AuthGuard } from '@nestjs/passport';
import { NullableType } from '../../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagDto } from './dto/tag.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '@utils/dto/infinity-pagination-response.dto';
import { QueryTagDto } from './dto/query-tag.dto';
import { infinityPagination } from '@utils/infinity-pagination';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';

@ApiTags('Tag')
@Controller({
  path: 'tag',
  version: '1',
})
export class TagController {
  constructor(private readonly service: TagService) {}

  //create tag
  // @ApiBearerAuth()
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('create')
  @ApiOkResponse({
    type: TagDto,
  })
  @HttpCode(HttpStatus.CREATED)
  public createTag(@Body() createDto: CreateTagDto): Promise<TagDto> {
    return this.service.create(createDto);
  }

  //update tag
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
    type: TagDto,
  })
  public update(
    @Param('id') id: TagDto['id'],
    @Body() tagDto: UpdateTagDto,
  ): Promise<NullableType<TagDto>> {
    console.log({
      id,
      tagDto,
    });

    return this.service.update(id, tagDto);
  }

  //get tag by id

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
    type: TagDto,
  })
  public findOne(@Param('id') id: TagDto['id']): Promise<NullableType<TagDto>> {
    return this.service.findById(id);
  }

  //get all tags

  @ApiOkResponse({
    type: InfinityPaginationResponse(TagDto),
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
    @Query() query: QueryTagDto,
  ): Promise<PaginationResponseDto<TagDto>> {
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

  //delete tag
  // @ApiBearerAuth()
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of tag IDs',
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
    description: 'Array of tag IDs',
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
