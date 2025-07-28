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
import { CouponService } from './coupon.service';

import { CouponEntity } from './entity/coupon.entity';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/domain/role';
import { RoleEnum } from '../roles/roles.enum';
import {
  CreateCouponDto,
  QueryCouponDto,
  UpdateCouponDto,
} from './dto/coupon.dto';

@ApiTags('Coupons')
@Controller({
  path: 'coupons',
  version: '1',
})
@ApiBearerAuth()
@Roles(RoleEnum.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of coupon IDs',
    example: [1, 2, 3],
    required: true,
  })
  @ApiQuery({
    name: 'status',
    type: 'number',
    required: true,
  })
  @Patch('status')
  @ApiOperation({ summary: 'Update coupons status (Admin)' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateStatus(
    @Query('ids') ids: number[],
    @Query('status') status: number,
  ): Promise<void> {
    console.log(ids);

    return this.couponService.updateStatus(ids, status);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create coupon (Admin)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CouponEntity })
  async create(@Body() dto: CreateCouponDto): Promise<CouponEntity> {
    return this.couponService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all coupons (Admin)' })
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
      campaignName: 'Summer',
      code: 'SUMMER',
      status: [{ id: 1 }],
    }),
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: JSON.stringify([
      { orderBy: 'createdAt', order: 'DESC' },
      { orderBy: 'campaignName', order: 'ASC' },
    ]),
  })
  async findAll(@Query() query: QueryCouponDto) {
    const { page = 1, limit = 10, filters, sort } = query;
    return this.couponService.findManyWithPagination({
      filterOptions: filters,
      sortOptions: sort,
      paginationOptions: { page, limit },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: CouponEntity })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CouponEntity> {
    return this.couponService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update coupon (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: CouponEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCouponDto,
  ): Promise<CouponEntity> {
    return this.couponService.update(id, dto);
  }

  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of coupon IDs',
    example: [1, 2, 3],
    required: true,
  })
  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete coupons (Admin)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(@Query('ids') ids: number[]): Promise<void> {
    return this.couponService.remove(ids);
  }
}
