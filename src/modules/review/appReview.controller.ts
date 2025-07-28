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
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ReviewService } from './review.service';
import { ReviewEntity } from './entity/review.entity';
import {
  CreateReviewDto,
  CreateUserReviewDto,
  UpdateReviewDto,
} from './dto/review.dto';

@ApiTags('App Reviews')
@Controller({
  path: 'app-reviews',
  version: '1',
})
export class AppReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('product/:productId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create review for product' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ReviewEntity })
  async create(
    @Req() req: Request,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateUserReviewDto,
  ): Promise<ReviewEntity> {
    const payload = { ...dto, userId: req.user['id'], productId, status: 1 };
    return this.reviewService.create(payload);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all reviews for product' })
  @ApiResponse({ status: HttpStatus.OK })
  async findAllForProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewService.findManyWithPagination({
      filterOptions: {
        productId,
        status: [{ id: 1 }], // Only active reviews
      },
      sortOptions: [{ orderBy: 'id', order: 'DESC' }],
      paginationOptions: { page, limit },
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own review' })
  @ApiResponse({ status: HttpStatus.OK, type: ReviewEntity })
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    const review = await this.reviewService.findOne(id);
    if (review.user.id !== req.user['id']) {
      throw new ForbiddenException("Cannot update other user's review");
    }
    const payload = Object.assign({}, dto, { status: 1 });

    return this.reviewService.update(id, payload);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own review' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const review = await this.reviewService.findOne(id);
    if (review.user.id !== req.user['id']) {
      throw new ForbiddenException("Cannot delete other user's review");
    }
    return this.reviewService.remove([id]);
  }
}
