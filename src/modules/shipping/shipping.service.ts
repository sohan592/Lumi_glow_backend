import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateShippingDto,
  FilterShippingDto,
  QueryShippingDto,
  SortShippingDto,
  UpdateShippingDto,
} from './dto/shipping.dto';
import { ShippingEntity } from './entity/shipping.entity';
import { ShippingRepository } from './repositories/shipping.repository';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';

@Injectable()
export class ShippingService {
  constructor(private readonly shippingRepository: ShippingRepository) {}

  async create(dto: CreateShippingDto): Promise<ShippingEntity> {
    return this.shippingRepository.create(dto);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterShippingDto | null;
    sortOptions?: SortShippingDto[] | null;
    paginationOptions: IPaginationOptions;
  }) {
    return this.shippingRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findOne(id: number): Promise<ShippingEntity> {
    const shipping = await this.shippingRepository.findById(id);
    if (!shipping) {
      throw new NotFoundException('Shipping method not found');
    }
    return shipping;
  }

  async update(id: number, dto: UpdateShippingDto): Promise<ShippingEntity> {
    return this.shippingRepository.update(id, dto);
  }

  async remove(ids: number[]): Promise<void> {
    return this.shippingRepository.remove(ids);
  }

  async updateStatus(ids: number[], statusId: number): Promise<void> {
    return this.shippingRepository.updateStatus(ids, statusId);
  }

  async findManyWhereStandardFirst(): Promise<ShippingEntity[]> {
    return this.shippingRepository.findManyWhereStandardFirst();
  }
}
