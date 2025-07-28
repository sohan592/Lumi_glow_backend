import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import {
  ShippingController,
  UserShippingController,
} from './shipping.controller';
import { ShippingService } from './shipping.service';
import { ShippingRepository } from './repositories/shipping.repository';
import { ShippingEntity } from './entity/shipping.entity';
import { StatusEntity } from '../statuses/entity/status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShippingEntity, StatusEntity]),
    JwtModule.register({}),
  ],
  controllers: [ShippingController, UserShippingController],
  providers: [ShippingService, ShippingRepository],
  exports: [ShippingService, ShippingRepository],
})
export class ShippingModule {}
