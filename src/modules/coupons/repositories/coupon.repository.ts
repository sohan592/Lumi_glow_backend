import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  Repository,
  In,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { CouponEntity } from '../entity/coupon.entity';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { NullableType } from '@utils/types/nullable.type';
import { createSlug } from '@utils/utils';
import {
  CreateCouponDto,
  FilterCouponDto,
  SortCouponDto,
  UpdateCouponDto,
} from '../dto/coupon.dto';
import { ProductEntity } from '@src/modules/products/entity/product.entity';
import { CategoryEntity } from '@src/modules/categories/entity/category.entity';

@Injectable()
export class CouponRepository {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(dto: CreateCouponDto): Promise<CouponEntity> {
    const existingByName = await this.couponRepository.findOne({
      where: { campaignName: dto.campaignName },
    });
    if (existingByName) {
      throw new BadRequestException('This campaignName is already in use');
    }

    const existingByCode = await this.couponRepository.findOne({
      where: { code: dto.code },
    });
    if (existingByCode) {
      throw new BadRequestException('This coupon code is already in use');
    }

    // Validate if productIds exist
    if (dto.productIds) {
      const products = await this.productRepository.find({
        where: { id: In(dto.productIds), status: { id: 1 } },
      });
      if (products.length !== dto.productIds.length) {
        throw new BadRequestException('Some product IDs are invalid');
      }
    }

    // Validate if categoryIds exist
    if (dto.categoryIds) {
      const categories = await this.categoryRepository.find({
        where: { id: In(dto.categoryIds), status: { id: 1 } },
      });
      if (categories.length !== dto.categoryIds.length) {
        throw new BadRequestException('Some category IDs are invalid');
      }
    }
    const couponEntity = this.couponRepository.create({
      ...dto,
      status: { id: dto.status },
      products: dto.productIds?.map((id) => ({ id })),
      categories: dto.categoryIds?.map((id) => ({ id })),
    });

    return this.couponRepository.save(couponEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCouponDto | null;
    sortOptions?: SortCouponDto[] | null;
    paginationOptions: IPaginationOptions;
  }) {
    const where: FindOptionsWhere<CouponEntity> = {};

    if (filterOptions?.campaignName) {
      where.campaignName = ILike(
        `%${filterOptions.campaignName.toLowerCase()}%`,
      );
    }

    if (filterOptions?.code) {
      where.code = ILike(`%${filterOptions.code.toUpperCase()}%`);
    }

    if (filterOptions?.status?.length) {
      where.status = filterOptions.status.map((status) => ({
        id: Number(status.id),
      }));
    }

    const [entities, total] = await this.couponRepository.findAndCount({
      where,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: sortOptions?.length
        ? sortOptions.reduce(
            (acc, sort) => ({ ...acc, [sort.orderBy]: sort.order }),
            {},
          )
        : { id: 'DESC' },
      relations: ['status', 'products', 'categories'],
    });

    return { data: entities, total };
  }

  async findById(id: number): Promise<NullableType<CouponEntity>> {
    return this.couponRepository.findOne({
      where: { id: Number(id) },
      relations: ['status', 'products', 'categories'],
    });
  }

  async findValidCoupon(
    code: string,
    userId: number,
  ): Promise<NullableType<CouponEntity>> {
    const now = new Date();
    return this.couponRepository.findOne({
      where: {
        code: code.toUpperCase(),
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
        status: { id: 1 }, // Active status
        maxUses: MoreThanOrEqual(0),
      },
      relations: ['status', 'products', 'categories'],
    });
  }

  async update(id: number, dto: UpdateCouponDto): Promise<CouponEntity> {
    const coupon = await this.findById(id);
    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }
    if (dto.campaignName) {
      const sameName = await this.couponRepository.findOne({
        where: { campaignName: dto.campaignName },
      });
      if (sameName && sameName.id !== id) {
        throw new BadRequestException('Campaign name already in use');
      }
    }

    if (dto.code) {
      const sameCode = await this.couponRepository.findOne({
        where: { code: dto.code },
      });
      if (sameCode && sameCode.id !== id) {
        throw new BadRequestException('Coupon code already in use');
      }
    }

    if (dto.productIds) {
      const matchingProducts = await this.productRepository.find({
        where: { id: In(dto.productIds), status: { id: 1 } },
      });
      if (matchingProducts.length !== dto.productIds.length) {
        throw new BadRequestException('Invalid product IDs');
      }
    }

    if (dto.categoryIds) {
      const matchingCategories = await this.categoryRepository.find({
        where: { id: In(dto.categoryIds), status: { id: 1 } },
      });
      if (matchingCategories.length !== dto.categoryIds.length) {
        throw new BadRequestException('Invalid category IDs');
      }
    }

    Object.assign(coupon, {
      ...dto,
      status: dto.status ? { id: dto.status } : { id: coupon.status.id },
      products: dto.productIds?.map((id) => ({ id })),
      categories: dto.categoryIds?.map((id) => ({ id })),
    });

    return this.couponRepository.save(coupon);
  }

  async incrementUsage(id: number): Promise<void> {
    await this.couponRepository.increment({ id }, 'usageCount', 1);
  }

  async remove(ids: number[]): Promise<void> {
    const coupons = await this.couponRepository.find({
      where: { id: In(ids) },
      relations: ['products', 'categories'],
    });
    await this.couponRepository.remove(coupons);
  }

  async updateStatus(ids: number[], statusId: number): Promise<void> {
    await this.couponRepository.update(
      { id: In(ids) },
      { status: { id: statusId } },
    );
  }
}
