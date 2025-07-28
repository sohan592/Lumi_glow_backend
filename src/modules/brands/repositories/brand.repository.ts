import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, In, ILike } from 'typeorm';
import { BrandTableEntity } from '../entity/brand.entity';
import { FilterBrandDto, SortBrandDto } from '../dto/query-brand.dto';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { NullableType } from '@utils/types/nullable.type';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { BrandDto } from '../dto/brand.dto';
import { StatusEntity } from '@src/modules/statuses/entity/status.entity';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { log } from 'console';
import { BrandPaginationDto } from '../dto/brand-pagination.dto';
import { createSlug } from '@utils/utils';

@Injectable()
export class BrandRepository {
  constructor(
    @InjectRepository(BrandTableEntity)
    private readonly brandRepository: Repository<BrandTableEntity>,
  ) {}

  async create(data: CreateBrandDto): Promise<BrandDto> {
    const brandEntity = Object.assign(new BrandTableEntity(), {
      ...data,
      slug: data.slug || createSlug(data.name),
      status: data.status ? { id: data.status } : undefined,
    });

    return this.brandRepository.save(brandEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBrandDto | null;
    sortOptions?: SortBrandDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<BrandPaginationDto> {
    const where: FindOptionsWhere<BrandTableEntity> = {};
    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name.toLowerCase()}%`);
    }

    if (filterOptions?.status?.length) {
      where.status = filterOptions.status.map((status) => ({
        id: Number(status.id),
      }));
    }
    const defaultOrder = { id: 'DESC' };
    const [entities, total] = await this.brandRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      order: sortOptions?.length
        ? sortOptions.reduce(
            (acc, sort) => ({ ...acc, [sort.orderBy]: sort.order }),
            {},
          )
        : defaultOrder,
      relations: ['status'],
    });

    return { data: entities, total };
  }

  async findById(id: number): Promise<NullableType<BrandDto>> {
    const entity = await this.brandRepository.findOne({
      where: { id: Number(id) },
      relations: ['status'],
    });

    return entity || null;
  }

  async update(id: number, payload: UpdateBrandDto): Promise<BrandDto> {
    console.log({
      id,
      payload,
    });

    const entity = await this.brandRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Brand not found');
    }

    Object.assign(entity, payload);
    const updatedEntity = await this.brandRepository.save(entity);
    return updatedEntity;
  }
  async remove(ids: number[]): Promise<void> {
    await this.brandRepository.delete({ id: In(ids) });
  }

  async updateMany(ids: number[], data: UpdateBrandDto): Promise<void> {
    const entities = await this.brandRepository.find({
      where: { id: In(ids) },
    });

    if (!entities.length) {
      throw new BadRequestException('Brands not found');
    }

    const updatedEntities = entities.map((entity) =>
      Object.assign(entity, {
        ...data,
        status: data.status ? { id: data.status } : undefined,
      }),
    );
    await this.brandRepository.save(updatedEntities);
  }
}
