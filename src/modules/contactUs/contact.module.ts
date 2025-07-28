import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import {
  ContactController,
  PublicContactController,
} from './contact.controller';
import { ContactService } from './contact.service';
import { ContactRepository } from './repositories/contact.repository';
import { ContactEntity } from './entity/contact.entity';
import { StatusEntity } from '../statuses/entity/status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactEntity, StatusEntity]),
    JwtModule.register({}),
  ],
  controllers: [ContactController, PublicContactController],
  providers: [ContactService, ContactRepository],
  exports: [ContactService, ContactRepository],
})
export class ContactModule {}
