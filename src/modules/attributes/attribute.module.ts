import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeController } from './attribute.controller';
import { AttributeService } from './attribute.service';
import { AttributeEntity } from './entity/attribute.entity';
import { AttributeRepository } from './repositories/attribute.repository';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([AttributeEntity]),
  ],
  controllers: [AttributeController],
  providers: [AttributeService, AttributeRepository],
  exports: [AttributeService, AttributeRepository],
})
export class AttributeModule {}
