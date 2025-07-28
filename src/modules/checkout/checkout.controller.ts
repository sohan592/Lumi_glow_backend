import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { CheckoutService } from './checkout.service';
import { CheckoutEntity, PaymentStatus } from './entity/checkout.entity';
import {
  CreateCheckoutDto,
  CreateCheckoutFromCartDto,
  QueryCheckoutDto,
} from './dto/checkout.dto';
import { Request } from 'express';
import { StripeService } from './stripe.service';

@ApiTags('User Checkout')
@Controller({
  path: 'user/checkout',
  version: '1',
})
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'), RolesGuard)
// @Roles(RoleEnum.USER)
export class UserCheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly stripeService: StripeService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create checkout' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CheckoutEntity })
  async create(
    @Body() dto: CreateCheckoutDto,
    @Req() req: Request,
  ): Promise<CheckoutEntity> {
    return this.checkoutService.create(req.user['id'], dto);
  }

  @Get('user-checkouts')
  @ApiOperation({ summary: 'Get user checkouts' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  async findByUser(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.checkoutService.findByuserForFrontend(req.user['id'], {
      page,
      limit,
    });
  }

  @Post('cart')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create checkout from cart' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CheckoutEntity })
  async createFromCart(
    @Req() req: Request,
    @Body() dto: CreateCheckoutFromCartDto,
  ): Promise<CheckoutEntity> {
    return this.checkoutService.createFromCart(req.user['id'], dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get checkout by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: CheckoutEntity })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CheckoutEntity> {
    return this.checkoutService.findById(id);
  }

  @Post(':checkoutId/validate-coupon/:couponId')
  @ApiOperation({ summary: 'Validate coupon for checkout' })
  @ApiResponse({ status: HttpStatus.OK })
  async validateCoupon(
    @Param('checkoutId', ParseIntPipe) checkoutId: number,
    @Param('couponId', ParseIntPipe) couponId: number,
  ) {
    return this.checkoutService.validateCouponAmount(checkoutId, couponId);
  }

  @Post('intent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Stripe payment intent',
    description:
      'Creates a Stripe payment intent for processing card payments. Returns a client secret that can be used on the frontend to complete the payment.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment intent created successfully',
    schema: {
      type: 'object',
      properties: {
        clientSecret: {
          type: 'string',
          description:
            'Client secret to be used on frontend for payment confirmation',
          example: 'pi_1234567890_secret_abcdefghijk',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid amount provided',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Stripe service error or configuration issue',
  })
  @ApiBody({
    description: 'Payment intent creation data',
    schema: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: {
          type: 'number',
          description: 'Amount in cents (USD). For $10.00, send 1000',
          example: 1000,
          minimum: 50,
        },
      },
    },
  })
  async createIntent(@Body() body: { amount: number }) {
    const intent = await this.stripeService.createPaymentIntent(
      body.amount,
      'usd',
    );
    return { clientSecret: intent.client_secret };
  }
}

@ApiTags('Admin Checkout')
@Controller({
  path: 'admin/checkout',
  version: '1',
})
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleEnum.ADMIN)
export class AdminCheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get()
  @ApiOperation({ summary: 'Get all checkouts' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiQuery({
    name: 'filters',
    required: false,
    type: String,
    example: JSON.stringify({
      userId: 1,
      statusId: 1,
      paymentStatus: 'PAID',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      paymentStartDate: '2023-01-01',
      paymentEndDate: '2023-12-31',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      location: 'New York',
      productIds: [1, 2, 3],
      categoryId: 1,
    }),
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: '[{"orderBy":"name","order":"ASC"}]',
  })
  async findAll(@Query() query: QueryCheckoutDto) {
    const { page = 1, limit = 10, filters, sort } = query;
    return this.checkoutService.findManyWithPagination(
      filters,
      {
        page,
        limit,
      },
      sort,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats' })
  @ApiResponse({ status: HttpStatus.OK })
  async getDashboardStats() {
    return this.checkoutService.getDashboardStats();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user checkouts' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.checkoutService.findByUser(userId, { page, limit });
  }

  @Patch(':id/status/:statusId')
  @ApiOperation({ summary: 'Update checkout status' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiParam({
    name: 'statusId',
    type: Number,
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        note: {
          type: 'string',
        },
      },
    },
  })
  async updateStatus(
    @Param('id') id: number,
    @Param('statusId') statusId: number,
    @Body('note') note?: string,
    @Body('title') title?: string,
  ): Promise<void> {
    if (statusId < 5 || statusId > 9) {
      throw new Error('Invalid status ID. Must be between 5 and 9');
    }
    return this.checkoutService.updateStatus(+id, +statusId, note, title);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PAID', 'FAILED', 'PENDING', 'REFUNDED'],
        },
        details: {
          type: 'object',
        },
      },
    },
  })
  async updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: PaymentStatus,
    @Body('details') details?: Record<string, any>,
  ): Promise<void> {
    return this.checkoutService.updatePaymentStatus(id, status, details);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel checkout' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ): Promise<void> {
    return this.checkoutService.cancel(id, reason);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get checkout by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: CheckoutEntity })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CheckoutEntity> {
    return this.checkoutService.findById(id);
  }

  @Get(':id/status-history')
  @ApiOperation({ summary: 'Get checkout status history' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  async getStatusHistory(@Param('id', ParseIntPipe) id: number) {
    return this.checkoutService.getStatusHistory(id);
  }
}
