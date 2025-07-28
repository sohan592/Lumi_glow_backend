import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { NullableType } from '../../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandRepository } from './repositories/brand.repository';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandDto } from './dto/brand.dto';
import { FilterBrandDto, SortBrandDto } from './dto/query-brand.dto';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { BrandPaginationDto } from './dto/brand-pagination.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async create(dto: CreateBrandDto): Promise<BrandDto> {
    const brand = await this.brandRepository.create(dto);
    return brand;
  }

  async update(
    id: number,
    brandDto: UpdateBrandDto,
  ): Promise<NullableType<BrandDto>> {
    const currentBrand = await this.brandRepository.findById(id);

    if (!currentBrand) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          brand: 'brandNotFound',
        },
      });
    }

    const brand = await this.brandRepository.update(id, brandDto);
    return brand;
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
    return this.brandRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findById(id: number): Promise<NullableType<BrandDto>> {
    return this.brandRepository.findById(id);
  }

  async softDelete(ids: number[]): Promise<void> {
    await this.brandRepository.remove(ids);
  }

  async updateStatus(ids: number[], status: number): Promise<void> {
    await this.brandRepository.updateMany(ids, { status });
  }
}
