import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { NullableType } from '../../utils/types/nullable.type';
import { CategoryPaginationDto } from './dto/category-pagnation.dto';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FilterCategoryDto, SortCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    if (dto.name && !dto.slug) {
      dto.slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    const category = await this.categoryRepository.create(dto);
    return category;
  }

  async update(
    id: number,
    categoryDto: UpdateCategoryDto,
  ): Promise<NullableType<CategoryDto>> {
    const currentCategory = await this.categoryRepository.findById(id);

    if (!currentCategory) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          category: 'categoryNotFound',
        },
      });
    }

    const category = await this.categoryRepository.update(id, categoryDto);
    return category;
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
    return this.categoryRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findById(id: number): Promise<NullableType<CategoryDto>> {
    return this.categoryRepository.findById(id);
  }

  async softDelete(ids: number[]): Promise<void> {
    await this.categoryRepository.remove(ids);
  }

  async updateStatus(ids: number[], status: number): Promise<void> {
    await this.categoryRepository.updateMany(ids, { status });
  }
}
