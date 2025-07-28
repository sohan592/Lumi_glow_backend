import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from './entity/tag.entity';
import { TagRepository } from './repositories/tag.repository';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([TagEntity])],
  controllers: [TagController],
  providers: [TagService, TagRepository],
  exports: [TagService, TagRepository],
})
export class TagModule {}
