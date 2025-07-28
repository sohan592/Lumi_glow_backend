import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponRepository } from './repositories/coupon.repository';
import { CouponEntity } from './entity/coupon.entity';
import { ProductEntity } from '../products/entity/product.entity';
import { CategoryEntity } from '../categories/entity/category.entity';
import { StatusEntity } from '../statuses/entity/status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      ProductEntity,
      CategoryEntity,
      StatusEntity,
    ]),
    JwtModule.register({}),
  ],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository],
  exports: [CouponService, CouponRepository],
})
export class CouponModule {}
