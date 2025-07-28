import { Injectable } from '@nestjs/common';
import { CheckoutRepository } from './repositories/checkout.repository';
import {
  CreateCheckoutDto,
  CreateCheckoutFromCartDto,
  SortCheckoutDto,
} from './dto/checkout.dto';
import { CheckoutEntity, PaymentStatus } from './entity/checkout.entity';
import { IPaginationOptions } from '@utils/types/pagination-options';

@Injectable()
export class CheckoutService {
  constructor(private readonly checkoutRepository: CheckoutRepository) {}

  async create(
    userId: number,
    dto: CreateCheckoutDto,
  ): Promise<CheckoutEntity> {
    return this.checkoutRepository.create(userId, dto);
  }

  async createFromCart(
    userId: number,
    dto: CreateCheckoutFromCartDto,
  ): Promise<CheckoutEntity> {
    return this.checkoutRepository.createFromCart(userId, dto);
  }

  async findManyWithPagination(
    filterOptions: any,
    paginationOptions: IPaginationOptions,
    sortOptions?: SortCheckoutDto[] | null,
  ) {
    return this.checkoutRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async getDashboardStats(): Promise<any> {
    return this.checkoutRepository.getDashboardStats();
  }

  async findByUser(userId: number, paginationOptions: IPaginationOptions) {
    return this.checkoutRepository.findByUser(userId, paginationOptions);
  }

  async findByuserForFrontend(
    userId: number,
    paginationOptions: IPaginationOptions,
  ) {
    return this.checkoutRepository.findByUserForFrontend(
      userId,
      paginationOptions,
    );
  }

  async findById(id: number): Promise<CheckoutEntity | null> {
    return this.checkoutRepository.findById(id);
  }

  async updateStatus(
    id: number,
    statusId: number,
    lastStatusNote?: string,
    title?: string,
  ): Promise<void> {
    return this.checkoutRepository.updateStatus(
      id,
      statusId,
      lastStatusNote,
      title,
    );
  }

  async updatePaymentStatus(
    id: number,
    paymentStatus: PaymentStatus,
    paymentDetails?: Record<string, any>,
  ): Promise<void> {
    return this.checkoutRepository.updatePaymentStatus(
      id,
      paymentStatus,
      paymentDetails,
    );
  }

  async cancel(id: number, reason?: string): Promise<void> {
    return this.checkoutRepository.cancel(id, reason);
  }

  async validateCouponAmount(checkoutId: number, couponId: number) {
    return this.checkoutRepository.validateCouponAmount(checkoutId, couponId);
  }
  async getStatusHistory(checkoutId: number) {
    return this.checkoutRepository.getStatusHistory(checkoutId);
  }
}
