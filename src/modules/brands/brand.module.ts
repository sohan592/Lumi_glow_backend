import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandTableEntity } from './entity/brand.entity';
import { BrandRepository } from './repositories/brand.repository';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([BrandTableEntity]),
  ],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository],
  exports: [BrandService, BrandRepository],
})
export class BrandModule {}
