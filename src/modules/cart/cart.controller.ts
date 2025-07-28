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
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartEntity } from './entity/cart.entity';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('User | Cart')
@Controller({
  path: 'cart',
  version: '1',
})
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('bulk')
  @ApiQuery({
    name: 'cartIds',
    type: 'array',
    items: {
      type: 'number',
    },
    description: 'Array of cart IDs',
    example: [1, 2, 3],
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove multiple items from cart' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async removeManyFromCart(
    @Req() req: Request,
    @Query(
      'cartIds',
      new ParseArrayPipe({
        items: Number,
        separator: ',',
        optional: false,
        exceptionFactory: () =>
          new BadRequestException(
            'Invalid cart IDs format. Expected comma-separated numbers',
          ),
      }),
    )
    cartIds: number[],
  ): Promise<void> {
    return this.cartService.removeManyFromCart(req.user['id'], cartIds);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CartEntity })
  async addToCart(
    @Req() req: Request,
    @Body() dto: CreateCartDto,
  ): Promise<CartEntity> {
    return this.cartService.addToCart(req.user['id'], dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get cart summary' })
  @ApiResponse({ status: HttpStatus.OK })
  async getCart(@Req() req: Request) {
    return this.cartService.getCartSummary(req.user['id']);
  }

  @Get('wishlist')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get wishlist' })
  @ApiResponse({ status: HttpStatus.OK })
  async getWishlist(@Req() req: Request) {
    return this.cartService.getWishlist(req.user['id']);
  }

  @Patch(':id/quantity')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update item quantity' })
  @ApiResponse({ status: HttpStatus.OK, type: CartEntity })
  async updateQuantity(
    @Req() req: Request,
    @Param('id', ParseIntPipe) cartId: number,
    @Query('quantity', ParseIntPipe) quantity: number,
  ): Promise<CartEntity> {
    return this.cartService.updateQuantity(req.user['id'], cartId, quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async removeFromCart(
    @Req() req: Request,
    @Param('id', ParseIntPipe) cartId: number,
  ): Promise<void> {
    return this.cartService.removeFromCart(req.user['id'], cartId);
  }

  @Patch(':id/wishlist')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Move item to wishlist' })
  @ApiResponse({ status: HttpStatus.OK })
  async moveToWishlist(
    @Req() req: Request,
    @Param('id', ParseIntPipe) cartId: number,
  ): Promise<void> {
    return this.cartService.moveToWishlist(req.user['id'], cartId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async clearCart(@Req() req: Request): Promise<void> {
    return this.cartService.clearCart(req.user['id']);
  }
}
