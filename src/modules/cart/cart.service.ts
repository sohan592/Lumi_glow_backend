import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from './repositories/cart.repository';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartEntity } from './entity/cart.entity';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async addToCart(userId: number, dto: CreateCartDto): Promise<CartEntity> {
    return this.cartRepository.addOrUpdateCartItem(userId, dto);
  }

  async getCartSummary(userId: number): Promise<{
    items: CartEntity[];
    totalItems: number;
    subtotal: number;
  }> {
    return this.cartRepository.getCartSummary(userId, false);
  }

  async getWishlist(userId: number): Promise<{
    items: CartEntity[];
    totalItems: number;
    subtotal: number;
  }> {
    return this.cartRepository.getCartSummary(userId, true);
  }

  async updateQuantity(
    userId: number,
    cartId: number,
    quantity: number,
  ): Promise<CartEntity> {
    return this.cartRepository.updateQuantity(userId, cartId, quantity);
  }

  async removeFromCart(userId: number, cartId: number): Promise<void> {
    return this.cartRepository.removeFromCart(userId, cartId);
  }

  async moveToWishlist(userId: number, cartId: number): Promise<void> {
    return this.cartRepository.toggleWishlist(userId, cartId);
  }

  async removeManyFromCart(userId: number, cartIds: number[]): Promise<void> {
    return this.cartRepository.removeManyFromCart(userId, cartIds);
  }

  async clearCart(userId: number): Promise<void> {
    const items = await this.cartRepository.find({
      where: {
        user: { id: userId },
        isActive: true,
        isWishlist: false,
      },
    });

    if (!items.length) {
      throw new NotFoundException('Cart is empty');
    }

    await Promise.all(
      items.map((item) => this.cartRepository.removeFromCart(userId, item.id)),
    );
  }
}
