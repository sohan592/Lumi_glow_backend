import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { NullableType } from '../../utils/types/nullable.type';
import { ProductOutputDto } from './dto/product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto, SortProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './repositories/product.repository';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(dto: CreateProductDto): Promise<ProductOutputDto> {
    const product = await this.productRepository.create(dto);
    return product;
  }

  async update(
    id: number,
    productDto: UpdateProductDto,
  ): Promise<NullableType<ProductOutputDto>> {
    const currentProduct = await this.productRepository.findById(id);

    if (!currentProduct) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          product: 'productNotFound',
        },
      });
    }

    const product = await this.productRepository.update(id, productDto);
    return product;
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductDto | null;
    sortOptions?: SortProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResponseDto<ProductOutputDto>> {
    return this.productRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findManyForFrontend({
    categoryId,
    keyword,
    paginationOptions,
    isDiscounted,
    excludeProductId,
    tagSlug,
  }: {
    categoryId?: number;
    keyword?: string;
    paginationOptions: IPaginationOptions;
    isDiscounted?: boolean;
    excludeProductId?: number;
    tagSlug?: string;
  }): Promise<PaginationResponseDto<ProductOutputDto>> {
    return this.productRepository.findManyForFrontend({
      categoryId,
      keyword,
      paginationOptions,
      isDiscounted,
      excludeProductId,
      tagSlug,
    });
  }

  async findById(
    id: number,
    userId: number,
  ): Promise<NullableType<ProductOutputDto>> {
    return this.productRepository.findById(id, userId);
  }

  async softDelete(ids: number[]): Promise<void> {
    await this.productRepository.remove(ids);
  }

  async updateStatus(ids: number[], status: number): Promise<void> {
    await this.productRepository.updateMany(ids, { status });
  }
}
