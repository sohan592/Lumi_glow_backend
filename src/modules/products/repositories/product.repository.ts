import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import {
  Between,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductOutputDto } from '../dto/product.dto';
import { FilterProductDto, SortProductDto } from '../dto/query-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity, StockStatus } from '../entity/product.entity';
import { createSlug } from '@utils/utils';
import { CartEntity } from '@src/modules/cart/entity/cart.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
  ) {}

  async create(data: CreateProductDto): Promise<ProductEntity> {
    const productEntityInit = new ProductEntity();

    const productEntity = Object.assign(productEntityInit, {
      ...data,
      category: { id: data.categoryId },
      brand: data.brandId ? { id: data.brandId } : undefined,
      tags: data.tagIds?.map((id) => ({ id })),
      attributes: data.attributeIds?.map((id) => ({ id })),
      slug: createSlug(data.name),
      galleryImages: data.galleryImages?.map((id) => ({ id })),
    });

    return this.productRepository.save(productEntity);
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
    const where: FindOptionsWhere<ProductEntity> = {};

    if (filterOptions) {
      if (filterOptions.name) {
        where.name = ILike(`%${filterOptions.name.toLowerCase()}%`);
      }
      if (filterOptions.sku) {
        where.sku = ILike(`%${filterOptions.sku.toLowerCase()}%`);
      }
      if (filterOptions.barcode) {
        where.barcode = ILike(`%${filterOptions.barcode.toLowerCase()}%`);
      }
      if (filterOptions.categoryId?.length) {
        where.category = { id: In(filterOptions.categoryId) };
      }
      if (filterOptions.brandId?.length) {
        where.brand = { id: In(filterOptions.brandId) };
      }
      if (filterOptions.minPrice && filterOptions.maxPrice) {
        where.price = Between(filterOptions.minPrice, filterOptions.maxPrice);
      } else if (filterOptions.minPrice) {
        where.price = MoreThanOrEqual(filterOptions.minPrice);
      } else if (filterOptions.maxPrice) {
        where.price = LessThanOrEqual(filterOptions.maxPrice);
      }
      if (filterOptions.stockStatus?.length) {
        where.stockStatus = In(filterOptions.stockStatus);
      }
      if (filterOptions.tagIds?.length) {
        where.tags = { id: In(filterOptions.tagIds) };
      }
      if (filterOptions.attributeIds?.length) {
        where.attributes = { id: In(filterOptions.attributeIds) };
      }
      if (
        filterOptions.hasDiscount !== null &&
        filterOptions.hasDiscount !== undefined
      ) {
        where.discountPrice = filterOptions.hasDiscount
          ? Not(IsNull())
          : IsNull();
      }
      if (filterOptions.createdFrom && filterOptions.createdTo) {
        where.createdAt = Between(
          new Date(filterOptions.createdFrom),
          new Date(filterOptions.createdTo),
        );
      }
      if (filterOptions?.status?.length) {
        where.status = filterOptions.status.map((status) => ({
          id: Number(status.id),
        }));
      }
    }

    const defaultOrder = { id: 'DESC' };
    const [entities, total] = await this.productRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      order: sortOptions?.length
        ? sortOptions.reduce(
            (acc, sort) => ({ ...acc, [sort.orderBy]: sort.order }),
            {},
          )
        : defaultOrder,
      relations: [
        'status',
        'category',
        'brand',
        'tags',
        'attributes',
        'galleryImages',
        'featureImage',
      ],
    });

    return { data: entities, total };
  }

  async findById(id: number, userId?: number): Promise<any> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'category',
        'brand',
        'tags',
        'attributes',
        'galleryImages',
        'featureImage',
      ],
    });

    const isWishlist = await this.cartRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        product: {
          id,
        },
        isWishlist: true,
      },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return { ...product, isWishlist: !!isWishlist, wishlistId: isWishlist?.id };
  }

  async update(id: number, payload: UpdateProductDto): Promise<ProductEntity> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new BadRequestException('Product not found');
    }

    Object.assign(entity, {
      ...payload,
      category: payload.categoryId
        ? { id: payload.categoryId }
        : entity.category,
      brand: payload.brandId ? { id: payload.brandId } : entity.brand,
      tags: payload.tagIds?.map((id) => ({ id })),
      attributes: payload.attributeIds?.map((id) => ({ id })),
      galleryImages: payload.galleryImages?.map((id) => ({ id })),
    });

    return this.productRepository.save(entity);
  }

  async remove(ids: number[]): Promise<void> {
    const products = await this.productRepository.find({
      where: { id: In(ids) },
      relations: ['tags', 'attributes', 'galleryImages'],
    });

    if (!products.length) throw new BadRequestException('Products not found');

    for (const product of products) {
      product.tags = [];
      product.attributes = [];
      product.galleryImages = [];
    }

    await this.productRepository.save(products);
    await this.productRepository.remove(products);
  }

  async updateMany(ids: number[], data: UpdateProductDto): Promise<void> {
    const entities = await this.productRepository.find({
      where: { id: In(ids) },
    });

    if (!entities.length) {
      throw new BadRequestException('Products not found');
    }

    const updatedEntities = entities.map((entity) =>
      Object.assign(entity, {
        ...data,
        category: data.categoryId ? { id: data.categoryId } : entity.category,
        brand: data.brandId ? { id: data.brandId } : entity.brand,
        tags: data.tagIds?.map((id) => ({ id })),
        attributes: data.attributeIds?.map((id) => ({ id })),
      }),
    );

    await this.productRepository.save(updatedEntities);
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
    const where: FindOptionsWhere<ProductEntity> = {
      status: { id: 1 },
      stockStatus: StockStatus.IN_STOCK,
    };

    if (categoryId) {
      where.category = { id: categoryId };
    }

    if (keyword) {
      where.name = ILike(`%${keyword.toLowerCase()}%`);
    }

    if (isDiscounted) {
      where.discountPrice = Not(IsNull());
    }

    if (excludeProductId) {
      where.id = Not(excludeProductId);
    }
    if (tagSlug) {
      where.tags = { slug: tagSlug };
    }

    const [entities, total] = await this.productRepository.findAndCount({
      where,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: isDiscounted === true ? { discountPrice: 'DESC' } : { id: 'DESC' },
      relations: ['featureImage'],
      select: {
        id: true,
        name: true,
        price: true,
        discountPrice: true,
        featureImage: {
          path: true,
        },
      },
    });
    return { data: entities, total };
  }
}
