import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { NullableType } from '../../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { AttributeRepository } from './repositories/attribute.repository';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { AttributeDto } from './dto/attribute.dto';
import {
  FilterAttributeDto,
  SortAttributeDto,
} from './dto/query-attribute.dto';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';

@Injectable()
export class AttributeService {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async create(dto: CreateAttributeDto): Promise<AttributeDto> {
    const attribute = await this.attributeRepository.create(dto);
    return attribute;
  }

  async update(
    id: number,
    attributeDto: UpdateAttributeDto,
  ): Promise<NullableType<AttributeDto>> {
    const currentAttribute = await this.attributeRepository.findById(id);

    if (!currentAttribute) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          attribute: 'attributeNotFound',
        },
      });
    }

    const attribute = await this.attributeRepository.update(id, attributeDto);
    return attribute;
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
    return this.attributeRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findById(id: number): Promise<NullableType<AttributeDto>> {
    return this.attributeRepository.findById(id);
  }

  async softDelete(ids: number[]): Promise<void> {
    await this.attributeRepository.remove(ids);
  }

  async updateStatus(ids: number[], status: number): Promise<void> {
    await this.attributeRepository.updateMany(ids, { status });
  }
}
