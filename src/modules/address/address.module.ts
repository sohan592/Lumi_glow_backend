import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { AddressRepository } from './repositories/address.repository';
import { AddressEntity } from './entity/address.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AddressEntity, UserEntity]),
    JwtModule.register({}),
  ],
  controllers: [AddressController],
  providers: [AddressService, AddressRepository],
  exports: [AddressService, AddressRepository],
})
export class AddressModule {}
