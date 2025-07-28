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
  BadRequestException,
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
import { ReviewService } from './review.service';
import { ReviewEntity } from './entity/review.entity';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import {
  CreateReviewDto,
  QueryReviewDto,
  UpdateReviewDto,
} from './dto/review.dto';

@ApiTags('Reviews')
@Controller({
  path: 'reviews',
  version: '1',
})
@ApiBearerAuth()
@Roles(RoleEnum.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create review (Admin)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ReviewEntity })
  async create(@Body() dto: CreateReviewDto): Promise<ReviewEntity> {
    return this.reviewService.create(dto);
  }

  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: { type: 'number' },
    description: 'Comma separated review IDs',
    example: '1,2,3',
    required: true,
  })
  @ApiQuery({
    name: 'statusId',
    type: 'number',
    example: 1,
    required: true,
  })
  @Patch('status')
  @ApiOperation({ summary: 'Update reviews status (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input - IDs must be numbers',
  })
  async updateStatus(
    @Query(
      'ids',
      new ParseArrayPipe({
        items: Number,
        separator: ',',
        optional: false,
        exceptionFactory: () =>
          new BadRequestException('IDs must be valid numbers'),
      }),
    )
    ids: number[],
    @Query(
      'statusId',
      new ParseIntPipe({
        exceptionFactory: () =>
          new BadRequestException('Status ID must be a valid number'),
      }),
    )
    statusId: number,
  ): Promise<void> {
    return this.reviewService.updateStatus(ids, statusId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews (Admin)' })
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
      userId: 1,
      productId: 1,
      rating: 5,
      status: [{ id: 1 }],
    }),
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: JSON.stringify([
      { orderBy: 'createdAt', order: 'DESC' },
      { orderBy: 'rating', order: 'ASC' },
    ]),
  })
  async findAll(@Query() query: QueryReviewDto) {
    const { page = 1, limit = 10, filters, sort } = query;
    return this.reviewService.findManyWithPagination({
      filterOptions: filters,
      sortOptions: sort,
      paginationOptions: { page, limit },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: ReviewEntity })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ReviewEntity> {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update review (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: ReviewEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    return this.reviewService.update(id, dto);
  }

  @ApiQuery({
    name: 'ids',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of review IDs',
    example: [1, 2, 3],
    required: true,
  })
  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete reviews (Admin)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ): Promise<void> {
    return this.reviewService.remove(ids);
  }
}
