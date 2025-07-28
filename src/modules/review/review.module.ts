import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewRepository } from './repositories/review.repository';
import { ReviewEntity } from './entity/review.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { ProductEntity } from '../products/entity/product.entity';
import { StatusEntity } from '../statuses/entity/status.entity';
import { AppReviewController } from './appReview.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReviewEntity,
      UserEntity,
      ProductEntity,
      StatusEntity,
    ]),
    JwtModule.register({}),
  ],
  controllers: [ReviewController, AppReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
