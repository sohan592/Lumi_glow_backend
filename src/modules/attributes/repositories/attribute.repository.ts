import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, In, ILike } from 'typeorm';
import { AttributeEntity } from '../entity/attribute.entity';
import {
  FilterAttributeDto,
  SortAttributeDto,
} from '../dto/query-attribute.dto';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { NullableType } from '@utils/types/nullable.type';
import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { AttributeDto } from '../dto/attribute.dto';
import { StatusEntity } from '@src/modules/statuses/entity/status.entity';
import { UpdateAttributeDto } from '../dto/update-attribute.dto';
import { log } from 'console';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';

@Injectable()
export class AttributeRepository {
  constructor(
    @InjectRepository(AttributeEntity)
    private readonly attributeRepository: Repository<AttributeEntity>,
  ) {}

  async create(data: CreateAttributeDto): Promise<AttributeDto> {
    const attributeEntity = Object.assign(new AttributeEntity(), {
      ...data,
      status: data.status ? { id: data.status } : undefined,
    });

    return this.attributeRepository.save(attributeEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterAttributeDto | null;
    sortOptions?: SortAttributeDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResponseDto<AttributeDto>> {
    const where: FindOptionsWhere<AttributeEntity> = {};
    if (filterOptions?.internalName) {
      where.internalName = ILike(
        `%${filterOptions.internalName.toLowerCase()}%`,
      );
    }

    if (filterOptions?.status?.length) {
      where.status = filterOptions.status.map((status) => ({
        id: Number(status.id),
      }));
    }
    const defaultOrder = { id: 'DESC' };
    const [entities, total] = await this.attributeRepository.findAndCount({
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

  async findById(id: number): Promise<NullableType<AttributeDto>> {
    const entity = await this.attributeRepository.findOne({
      where: { id: Number(id) },
      relations: ['status', 'values'],
    });

    return entity || null;
  }

  async update(id: number, payload: UpdateAttributeDto): Promise<AttributeDto> {
    console.log({
      id,
      payload,
    });

    const entity = await this.attributeRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Attribute not found');
    }

    Object.assign(entity, payload);
    const updatedEntity = await this.attributeRepository.save(entity);
    return updatedEntity;
  }
  async remove(ids: number[]): Promise<void> {
    await this.attributeRepository.delete({ id: In(ids) });
  }

  async updateMany(ids: number[], data: UpdateAttributeDto): Promise<void> {
    const entities = await this.attributeRepository.find({
      where: { id: In(ids) },
    });

    if (!entities.length) {
      throw new Error('Attributes not found');
    }

    const updatedEntities = entities.map((entity) =>
      Object.assign(entity, {
        ...data,
        status: data.status ? { id: data.status } : undefined,
      }),
    );
    await this.attributeRepository.save(updatedEntities);
  }
}
