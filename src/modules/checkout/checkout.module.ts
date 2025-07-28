import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { CheckoutService } from './checkout.service';
import { CheckoutRepository } from './repositories/checkout.repository';

// Entities
import {
  CheckoutEntity,
  CheckoutItemEntity,
  CheckoutStatusHistoryEntity,
} from './entity/checkout.entity';
import { CartEntity } from '../cart/entity/cart.entity';
import { ProductEntity } from '../products/entity/product.entity';
import { CouponEntity } from '../coupons/entity/coupon.entity';
import {
  AdminCheckoutController,
  UserCheckoutController,
} from './checkout.controller';
import { AddressEntity } from '../address/entity/address.entity';
import { StripeService } from './stripe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CheckoutEntity,
      CheckoutItemEntity,
      CartEntity,
      ProductEntity,
      CouponEntity,
      AddressEntity,
      CheckoutStatusHistoryEntity,
    ]),
  ],
  controllers: [UserCheckoutController, AdminCheckoutController],
  providers: [CheckoutService, StripeService, CheckoutRepository],
  exports: [CheckoutService, StripeService],
})
export class CheckoutModule {}
