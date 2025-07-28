import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ShippingService } from './shipping.service';
import { ShippingEntity } from './entity/shipping.entity';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import {
  CreateShippingDto,
  QueryShippingDto,
  UpdateShippingDto,
} from './dto/shipping.dto';

@ApiTags('Shipping')
@Controller({
  path: 'shipping',
  version: '1',
})
@ApiBearerAuth()
@Roles(RoleEnum.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create shipping method (Admin)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ShippingEntity })
  async create(@Body() dto: CreateShippingDto): Promise<ShippingEntity> {
    return this.shippingService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipping methods (Admin)' })
  @ApiResponse({ status: HttpStatus.OK })
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
    example: JSON.stringify({
      internalName: 'express_shipping',
      displayName: 'Express Shipping',
      status: [{ id: 1 }],
    }),
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: JSON.stringify([
      { orderBy: 'createdAt', order: 'DESC' },
      { orderBy: 'displayName', order: 'ASC' },
    ]),
  })
  async findAll(@Query() query: QueryShippingDto) {
    const { page = 1, limit = 10, filters, sort } = query;
    return this.shippingService.findManyWithPagination({
      filterOptions: filters,
      sortOptions: sort,
      paginationOptions: { page, limit },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipping method by ID (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: ShippingEntity })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ShippingEntity> {
    return this.shippingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shipping method (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: ShippingEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShippingDto,
  ): Promise<ShippingEntity> {
    return this.shippingService.update(id, dto);
  }

  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of shipping method IDs',
    example: [1, 2, 3],
    required: true,
  })
  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete shipping methods (Admin)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ): Promise<void> {
    return this.shippingService.remove(ids);
  }

  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of shipping method IDs',
    example: [1, 2, 3],
    required: true,
  })
  @ApiQuery({
    name: 'statusId',
    type: 'number',
    required: true,
  })
  @Patch('status')
  @ApiOperation({ summary: 'Update shipping methods status (Admin)' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateStatus(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
    @Query('statusId', ParseIntPipe) statusId: number,
  ): Promise<void> {
    return this.shippingService.updateStatus(ids, statusId);
  }
}

@ApiTags('User Shipping')
@Controller({
  path: 'user/shipping',
  version: '1',
})
@ApiBearerAuth()
@Roles(RoleEnum.USER)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all shipping methods (User)' })
  @ApiResponse({ status: HttpStatus.OK })
  async findAll(): Promise<ShippingEntity[]> {
    return this.shippingService.findManyWhereStandardFirst();
  }
}
