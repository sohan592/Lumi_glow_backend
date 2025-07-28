import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './repositories/cart.repository';
import { CartEntity } from './entity/cart.entity';
import { ProductEntity } from '../products/entity/product.entity';
import { AttributeValueEntity } from '../attributes/entity/attributeValue.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([CartEntity, ProductEntity, AttributeValueEntity]),
  ],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository],
})
export class CartModule {}
