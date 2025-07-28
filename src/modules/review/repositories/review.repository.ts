import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, ILike, In } from 'typeorm';
import { ReviewEntity } from '../entity/review.entity';
import {
  CreateReviewDto,
  UpdateReviewDto,
  FilterReviewDto,
  SortReviewDto,
} from '../dto/review.dto';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { NullableType } from '@utils/types/nullable.type';
import { log } from 'handlebars';
import { stat } from 'fs';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
  ) {}

  async create(dto: CreateReviewDto): Promise<ReviewEntity> {
    const reviewEntity = this.reviewRepository.create({
      ...dto,
      status: { id: dto.status },
      user: { id: dto.userId },
      product: { id: dto.productId },
    });

    return this.reviewRepository.save(reviewEntity);
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
    let where:
      | FindOptionsWhere<ReviewEntity>
      | FindOptionsWhere<ReviewEntity>[] = {};

    if (filterOptions?.productId) {
      where = { product: { id: filterOptions.productId } };
    }

    if (filterOptions?.rating) {
      where = { ...where, rating: filterOptions.rating };
    }

    if (filterOptions?.status?.length) {
      where = {
        ...where,
        status: filterOptions.status.map((status) => ({
          id: Number(status.id),
        })),
      };
    }

    if (filterOptions?.keyword) {
      const keyword = `%${filterOptions.keyword}%`;
      where = [
        { comment: ILike(keyword) },
        { user: { firstName: ILike(keyword) } },
        { user: { lastName: ILike(keyword) } },
        { user: { email: ILike(keyword) } },
        { product: { name: ILike(keyword) } },
        { product: { description: ILike(keyword) } },
      ];
    }

    const [entities, total] = await this.reviewRepository.findAndCount({
      where,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: sortOptions?.length
        ? sortOptions.reduce(
            (acc, sort) => ({ ...acc, [sort.orderBy]: sort.order }),
            {},
          )
        : { createdAt: 'DESC' },
      relations: ['user', 'product', 'status'],
    });

    return { data: entities, total };
  }

  async findById(id: number): Promise<NullableType<ReviewEntity>> {
    return this.reviewRepository.findOne({
      where: { id: Number(id) },
      relations: ['status', 'user', 'product'],
    });
  }

  async update(id: number, dto: UpdateReviewDto): Promise<ReviewEntity> {
    const review = await this.findById(id);
    if (!review) {
      throw new BadRequestException('Review not found');
    }

    Object.assign(review, {
      ...dto,
      status: dto.status ? { id: dto.status } : { id: review.status.id },
    });

    return this.reviewRepository.save(review);
  }

  async remove(ids: number[]): Promise<void> {
    await this.reviewRepository.delete({ id: In(ids) });
  }

  async updateStatus(ids: number[], statusId: number): Promise<void> {
    await this.reviewRepository.update(
      { id: In(ids) },
      { status: { id: statusId } },
    );
  }
}
