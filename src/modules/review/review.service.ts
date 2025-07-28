import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRepository } from './repositories/review.repository';
import {
  CreateReviewDto,
  UpdateReviewDto,
  QueryReviewDto,
  FilterReviewDto,
  SortReviewDto,
} from './dto/review.dto';
import { ReviewEntity } from './entity/review.entity';
import { IPaginationOptions } from '@utils/types/pagination-options';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async create(dto: CreateReviewDto): Promise<ReviewEntity> {
    return this.reviewRepository.create(dto);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterReviewDto | null;
    sortOptions?: SortReviewDto[] | null;
    paginationOptions: IPaginationOptions;
  }) {
    return this.reviewRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findOne(id: number): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async update(id: number, dto: UpdateReviewDto): Promise<ReviewEntity> {
    return this.reviewRepository.update(id, dto);
  }

  async remove(ids: number[]): Promise<void> {
    return this.reviewRepository.remove(ids);
  }

  async updateStatus(ids: number[], statusId: number): Promise<void> {
    return this.reviewRepository.updateStatus(ids, statusId);
  }
}
