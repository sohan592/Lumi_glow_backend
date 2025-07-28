import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { CategoryPaginationDto } from '../dto/category-pagnation.dto';
import { CategoryDto } from '../dto/category.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { FilterCategoryDto, SortCategoryDto } from '../dto/query-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryEntity } from '../entity/category.entity';
import { ProductEntity } from '@src/modules/products/entity/product.entity';
import { createSlug } from '@utils/utils';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async create(data: CreateCategoryDto): Promise<CategoryDto> {
    const categoryEntity = Object.assign(new CategoryEntity(), {
      ...data,
      slug: data.slug || createSlug(data.name),
      status: data.status ? { id: data.status } : undefined,
    });

    return this.categoryRepository.save(categoryEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCategoryDto | null;
    sortOptions?: SortCategoryDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<CategoryPaginationDto> {
    const where: FindOptionsWhere<CategoryEntity> = {};
    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name.toLowerCase()}%`);
    }

    if (filterOptions?.status?.length) {
      where.status = filterOptions.status.map((status) => ({
        id: Number(status.id),
      }));
    }

    const defaultOrder = { id: 'DESC' };
    const [entities, total] = await this.categoryRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      order: sortOptions?.length
        ? sortOptions.reduce(
            (acc, sort) => ({ ...acc, [sort.orderBy]: sort.order }),
            {},
          )
        : defaultOrder,
      relations: ['status', 'products'],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: {
          id: true,
          name: true,
        },
        products: {
          id: true,
        },
      },
    });

    const enhancedEntities = entities.map((entity) => ({
      ...entity,
      productsCount: entity.products?.length || 0,
      products: undefined,
    }));

    return {
      data: enhancedEntities,
      total,
    };
  }

  async findById(id: number): Promise<NullableType<CategoryDto>> {
    const entity = await this.categoryRepository.findOne({
      where: { id: Number(id) },
      relations: ['status'],
    });

    return entity || null;
  }

  async update(id: number, payload: UpdateCategoryDto): Promise<CategoryDto> {
    console.log({
      id,
      payload,
    });

    const entity = await this.categoryRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Category not found');
    }

    Object.assign(entity, payload);
    const updatedEntity = await this.categoryRepository.save(entity);
    return updatedEntity;
  }
  async remove(ids: number[]): Promise<void> {
    const entities = await this.categoryRepository.find({
      where: { id: In(ids) },
    });

    console.log({
      ids,
      entities,
    });

    if (!entities.length) {
      throw new BadRequestException('Categories not found');
    }

    const defaultCategory = await this.categoryRepository.findOne({
      where: { id: 1 },
    });
    if (!defaultCategory) {
      throw new BadRequestException('Default category not found');
    }
    const categoryIds = entities.map((entity) => entity.id);
    await this.productRepository.update(
      { category: In(categoryIds) },
      { category: defaultCategory },
    );
    await this.categoryRepository.delete({ id: In(ids) });
  }

  async updateMany(ids: number[], data: UpdateCategoryDto): Promise<void> {
    const entities = await this.categoryRepository.find({
      where: { id: In(ids) },
    });

    if (!entities.length) {
      throw new BadRequestException('Categories not found');
    }

    const updatedEntities = entities.map((entity) =>
      Object.assign(entity, {
        ...data,
        status: data.status ? { id: data.status } : undefined,
      }),
    );
    await this.categoryRepository.save(updatedEntities);
  }
}
