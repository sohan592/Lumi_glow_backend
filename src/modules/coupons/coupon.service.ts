import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CouponRepository } from './repositories/coupon.repository';

import { IPaginationOptions } from '@utils/types/pagination-options';
import { CouponEntity } from './entity/coupon.entity';
import {
  CreateCouponDto,
  FilterCouponDto,
  SortCouponDto,
  UpdateCouponDto,
} from './dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly couponRepository: CouponRepository) {}

  async create(dto: CreateCouponDto): Promise<CouponEntity> {
    if (dto.startDate > dto.endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
    return this.couponRepository.create(dto);
  }

  async findManyWithPagination(options: {
    filterOptions?: FilterCouponDto | null;
    sortOptions?: SortCouponDto[] | null;
    paginationOptions: IPaginationOptions;
  }) {
    return this.couponRepository.findManyWithPagination(options);
  }

  async findOne(id: number): Promise<CouponEntity> {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async update(id: number, dto: UpdateCouponDto): Promise<CouponEntity> {
    if (dto.startDate && dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
    return this.couponRepository.update(id, dto);
  }

  async remove(ids: number[]): Promise<void> {
    return this.couponRepository.remove(ids);
  }

  async updateStatus(ids: number[], statusId: number): Promise<void> {
    return this.couponRepository.updateStatus(ids, statusId);
  }

  async validateCoupon(
    code: string,
    userId: number,
  ): Promise<{
    isValid: boolean;
    coupon?: CouponEntity;
    message?: string;
  }> {
    const coupon = await this.couponRepository.findValidCoupon(code, userId);

    if (!coupon) {
      return { isValid: false, message: 'Invalid or expired coupon' };
    }

    if (coupon.maxUses !== -1 && coupon.usageCount >= coupon.maxUses) {
      return { isValid: false, message: 'Coupon usage limit reached' };
    }

    return { isValid: true, coupon };
  }

  async calculateDiscount(
    coupon: CouponEntity,
    orderAmount: number,
  ): Promise<{
    discountAmount: number;
    message?: string;
  }> {
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return {
        discountAmount: 0,
        message: `Minimum order amount is ${coupon.minOrderAmount}`,
      };
    }

    let discountAmount =
      coupon.discountType === 'percentage'
        ? (orderAmount * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }

    return { discountAmount };
  }
}
