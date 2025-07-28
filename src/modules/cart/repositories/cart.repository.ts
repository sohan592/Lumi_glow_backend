import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { CartEntity } from '../entity/cart.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateCartDto, SelectedAttributeDto } from '../dto/create-cart.dto';
import {
  ProductEntity,
  StockStatus,
} from '../../products/entity/product.entity';
import { AttributeValueEntity } from '../../attributes/entity/attributeValue.entity';

@Injectable()
export class CartRepository extends Repository<CartEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(CartEntity, dataSource.createEntityManager());
  }

  async addOrUpdateCartItem(
    userId: number,
    dto: CreateCartDto,
  ): Promise<CartEntity> {
    return await this.manager.transaction(async (manager) => {
      const { productId, quantity, isWishlist, selectedAttributes } = dto;

      // 1. Validate product and check stock
      const product = await manager.findOne(ProductEntity, {
        where: {
          id: productId,
          stockStatus: StockStatus.IN_STOCK,
          status: { id: 1 }, // Active status
        },
        relations: ['attributes'],
      });

      if (!product) {
        throw new NotFoundException('Product not found or unavailable');
      }

      if (product.totalStock < quantity) {
        throw new BadRequestException('Requested quantity exceeds stock');
      }

      // 2. Validate attributes if provided
      if (selectedAttributes?.length) {
        const attributeValues = await manager.find(AttributeValueEntity, {
          where: { id: In(selectedAttributes.map((attr) => attr.valueId)) },
          relations: ['attribute'],
        });

        if (attributeValues.length !== selectedAttributes.length) {
          throw new BadRequestException('Invalid attribute values');
        }

        // Verify attributes belong to product
        const productAttributeIds = product.attributes.map((attr) => attr.id);
        const invalidAttributes = attributeValues.filter(
          (av) => !productAttributeIds.includes(av.attribute.id),
        );

        if (invalidAttributes.length) {
          throw new BadRequestException('Invalid attributes for this product');
        }
      }

      // 3. Check existing cart items
      const existingCartItems = await manager.find(CartEntity, {
        where: {
          user: { id: userId },
          product: { id: productId },
          isWishlist: !!isWishlist,
          isActive: true,
        },
      });

      // 4. Update existing item if attributes match
      for (const item of existingCartItems) {
        if (
          this.areAttributesEqual(item.selectedAttributes, selectedAttributes)
        ) {
          const newQuantity = item.quantity + quantity;

          if (product.totalStock < newQuantity) {
            throw new BadRequestException(
              'Total quantity exceeds stock or you already have this item in your cart',
            );
          }

          item.quantity = newQuantity;
          item.price = +product?.discountPrice || +product.price;
          item.total = item?.price * newQuantity;

          return manager.save(CartEntity, item);
        }
      }

      // 5. Create new cart item
      const newCartItem = manager.create(CartEntity, {
        user: { id: userId },
        product: { id: productId },
        quantity,
        price: +product?.discountPrice || +product.price,
        total: +product?.discountPrice || +product.price * quantity,
        isWishlist: !!isWishlist,
        isActive: true,
        selectedAttributes: selectedAttributes?.map((attr) => ({
          attributeId: attr.attributeId,
          valueId: attr.valueId,
        })),
      });

      return manager.save(CartEntity, newCartItem);
    });
  }

  async getCartSummary(
    userId: number,
    isWishlist = false,
  ): Promise<{
    items: CartEntity[];
    totalItems: number;
    subtotal: number;
  }> {
    const items = await this.find({
      where: {
        user: { id: userId },
        isActive: true,
        isWishlist,
      },
      relations: [
        'product',
        'product.featureImage',
        'product.attributes',
        'product.status',
      ],
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + +item.total, 0),
    };
  }

  // async getCartSummary(
  //   userId: number,
  //   isWishlist = false,
  // ): Promise<{
  //   items: CartEntity[];
  //   totalItems: number;
  //   subtotal: number;
  //   hasChangedPrices: boolean;
  // }> {
  //   const items = await this.find({
  //     where: {
  //       user: { id: userId },
  //       isActive: true,
  //       isWishlist,
  //     },
  //     relations: [
  //       'product',
  //       'product.featureImage',
  //       'product.attributes',
  //       'product.status',
  //     ],
  //     order: { createdAt: 'DESC' },
  //   });

  //   let hasChangedPrices = false;
  //   const processedItems = await Promise.all(
  //     items.map(async (item) => {
  //       const currentPrice = Number(item.product.price);
  //       if (currentPrice !== Number(item.price)) {
  //         hasChangedPrices = true;
  //         const newTotal = currentPrice * item.quantity;
  //         await this.update(item.id, {
  //           price: Number(currentPrice),
  //           total: Number(newTotal),
  //         });
  //         item.price = currentPrice;
  //         item.total = newTotal;
  //       }
  //       return item;
  //     }),
  //   );

  //   return {
  //     items: processedItems,
  //     totalItems: processedItems.reduce(
  //       (sum, item) => sum + Number(item.quantity),
  //       0,
  //     ),
  //     subtotal: processedItems.reduce(
  //       (sum, item) => sum + Number(item.total),
  //       0,
  //     ),
  //     hasChangedPrices,
  //   };
  // }

  async updateQuantity(
    userId: number,
    cartId: number,
    quantity: number,
  ): Promise<CartEntity> {
    return this.manager.transaction(async (manager) => {
      const cartItem = await manager.findOne(CartEntity, {
        where: {
          id: cartId,
          user: { id: userId },
          isActive: true,
        },
        relations: ['product'],
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      if (cartItem.product.totalStock < quantity) {
        throw new BadRequestException('Requested quantity exceeds stock');
      }
      if (quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0');
      }

      cartItem.quantity = quantity;
      cartItem.total =
        (cartItem?.product?.discountPrice || cartItem?.product?.price) *
        quantity;

      return manager.save(CartEntity, cartItem);
    });
  }

  async removeFromCart(userId: number, cartId: number): Promise<void> {
    const result = await this.delete({
      id: cartId,
      user: { id: userId },
      isActive: true,
    });

    if (!result.affected) {
      throw new NotFoundException('Cart item not found');
    }
  }

  async toggleWishlist(userId: number, cartId: number): Promise<void> {
    const cartItem = await this.findOne({
      where: { id: cartId, user: { id: userId }, isActive: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.isWishlist = !cartItem.isWishlist;
    await this.save(cartItem);
  }

  async removeManyFromCart(userId: number, cartIds: number[]): Promise<void> {
    const result = await this.delete({
      id: In(cartIds),
      user: { id: userId },
      isActive: true,
    });

    if (!result.affected) {
      throw new NotFoundException('No cart items found');
    }
  }

  private areAttributesEqual(
    existing: { attributeId: number; valueId: number }[] | null | undefined,
    incoming: SelectedAttributeDto[] | null | undefined,
  ): boolean {
    if (!existing && !incoming) return true;
    if (!existing || !incoming) return false;
    if (existing.length !== incoming.length) return false;

    const sortedExisting = [...existing].sort(
      (a, b) => a.attributeId - b.attributeId,
    );
    const sortedIncoming = [...incoming].sort(
      (a, b) => a.attributeId - b.attributeId,
    );

    return sortedExisting.every((exAttr, index) => {
      const incAttr = sortedIncoming[index];
      return (
        exAttr.attributeId === incAttr.attributeId &&
        exAttr.valueId === incAttr.valueId
      );
    });
  }
}
