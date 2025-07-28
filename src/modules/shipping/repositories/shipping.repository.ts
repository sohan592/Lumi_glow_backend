import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, ILike, In } from 'typeorm';
import { ShippingEntity } from '../entity/shipping.entity';
import {
  CreateShippingDto,
  UpdateShippingDto,
  FilterShippingDto,
  SortShippingDto,
} from '../dto/shipping.dto';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { NullableType } from '@utils/types/nullable.type';

@Injectable()
export class ShippingRepository {
  constructor(
    @InjectRepository(ShippingEntity)
    private readonly shippingRepository: Repository<ShippingEntity>,
  ) {}

  async create(dto: CreateShippingDto): Promise<ShippingEntity> {
    const existing = await this.shippingRepository.findOne({
      where: [
        { internalName: dto.internalName },
        { displayName: dto.displayName },
      ],
    });

    if (existing) {
      throw new BadRequestException(
        'Shipping method with same name already exists',
      );
    }

    const shippingEntity = this.shippingRepository.create({
      ...dto,
      status: { id: dto.status },
    });

    return this.shippingRepository.save(shippingEntity);
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
    const where: FindOptionsWhere<ShippingEntity> = {};

    if (filterOptions?.internalName) {
      where.internalName = ILike(
        `%${filterOptions.internalName.toLowerCase()}%`,
      );
    }

    if (filterOptions?.displayName) {
      where.displayName = ILike(`%${filterOptions.displayName.toLowerCase()}%`);
    }

    if (filterOptions?.status?.length) {
      where.status = filterOptions.status.map((status) => ({
        id: Number(status.id),
      }));
    }

    const [entities, total] = await this.shippingRepository.findAndCount({
      where,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: sortOptions?.length
        ? sortOptions.reduce(
            (acc, sort) => ({ ...acc, [sort.orderBy]: sort.order }),
            {},
          )
        : { id: 'DESC' },
      relations: ['status'],
    });

    return { data: entities, total };
  }

  async findById(id: number): Promise<NullableType<ShippingEntity>> {
    return this.shippingRepository.findOne({
      where: { id: Number(id) },
      relations: ['status'],
    });
  }

  async update(id: number, dto: UpdateShippingDto): Promise<ShippingEntity> {
    const shipping = await this.findById(id);
    if (!shipping) {
      throw new BadRequestException('Shipping method not found');
    }

    if (dto.internalName) {
      const sameInternalName = await this.shippingRepository.findOne({
        where: { internalName: dto.internalName },
      });
      if (sameInternalName && sameInternalName.id !== id) {
        throw new BadRequestException('Internal name already in use');
      }
    }

    if (dto.displayName) {
      const sameDisplayName = await this.shippingRepository.findOne({
        where: { displayName: dto.displayName },
      });
      if (sameDisplayName && sameDisplayName.id !== id) {
        throw new BadRequestException('Display name already in use');
      }
    }

    Object.assign(shipping, {
      ...dto,
      status: dto.status ? { id: dto.status } : undefined,
    });

    return this.shippingRepository.save(shipping);
  }

  async remove(ids: number[]): Promise<void> {
    await this.shippingRepository.delete({ id: In(ids) });
  }

  async updateStatus(ids: number[], statusId: number): Promise<void> {
    await this.shippingRepository.update(
      { id: In(ids) },
      { status: { id: statusId } },
    );
  }

  async findManyWhereStandardFirst(): Promise<ShippingEntity[]> {
    return this.shippingRepository.find({
      order: {
        internalName: 'ASC',
      },
      where: {
        status: { id: 1 }, // Assuming 1 is the ID for standard/default status
      },
      relations: ['status'],
    });
  }
}
