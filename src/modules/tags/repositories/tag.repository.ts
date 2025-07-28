import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { createSlug } from '@utils/utils';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { CreateTagDto } from '../dto/create-tag.dto';
import { FilterTagDto, SortTagDto } from '../dto/query-tag.dto';
import { TagPaginationDto } from '../dto/tag-pagination.dto';
import { TagDto } from '../dto/tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { TagEntity } from '../entity/tag.entity';

@Injectable()
export class TagRepository {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async create(data: CreateTagDto): Promise<TagDto> {
    const existingTag = await this.tagRepository.findOne({
      where: { name: data.name },
    });
    if (existingTag) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          name: 'tagNameAlreadyExists',
        },
      });
    }

    const tagEntity = Object.assign(new TagEntity(), {
      ...data,
      slug: data.slug || createSlug(data.name),
      status: data.status ? { id: data.status } : { id: 4 },
    });

    return this.tagRepository.save(tagEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterTagDto | null;
    sortOptions?: SortTagDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<TagPaginationDto> {
    const where: FindOptionsWhere<TagEntity> = {};

    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name.toLowerCase()}%`);
    }

    if (filterOptions?.status?.length) {
      where.status = filterOptions.status.map((status) => ({
        id: Number(status.id),
      }));
    }
    const defaultOrder = { id: 'DESC' };
    const [entities, total] = await this.tagRepository.findAndCount({
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

  async findById(id: number): Promise<NullableType<TagDto>> {
    const entity = await this.tagRepository.findOne({
      where: { id: Number(id) },
      relations: ['status'],
    });

    return entity || null;
  }

  async update(id: number, payload: UpdateTagDto): Promise<TagDto> {
    console.log({
      id,
      payload,
    });

    const entity = await this.tagRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Tag not found');
    }

    Object.assign(entity, payload);
    const updatedEntity = await this.tagRepository.save(entity);
    return updatedEntity;
  }
  async remove(ids: number[]): Promise<void> {
    const isAvailable = await this.tagRepository.find({
      where: { id: In(ids) },
    });
    if (!isAvailable.length) {
      throw new Error('Tags not found');
    }
    const idsOfNotConditionTags = isAvailable
      .filter((tag) => tag.isCondition === false)
      .map((tag) => tag.id);
    if (!idsOfNotConditionTags.length) {
      throw new Error('Tags not found');
    } else {
      await this.tagRepository.delete({ id: In(ids) });
    }
  }

  async updateMany(ids: number[], data: UpdateTagDto): Promise<void> {
    // Find all requested tags
    const entities = await this.tagRepository.find({
      where: { id: In(ids) },
    });

    if (!entities.length) {
      throw new Error('Tags not found');
    }

    // Filter to only update non-condition tags
    const nonConditionTags = entities.filter(
      (tag) => tag.isCondition === false,
    );

    if (!nonConditionTags.length) {
      throw new Error(
        'No updatable tags found - only condition tags were selected',
      );
    }

    // Prepare updates for non-condition tags only
    const updatedEntities = nonConditionTags.map((entity) =>
      Object.assign(entity, {
        ...data,
        status: data.status ? { id: data.status } : undefined,
      }),
    );

    // Save the updated entities
    await this.tagRepository.save(updatedEntities);
  }
}
