import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { NullableType } from '../../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagRepository } from './repositories/tag.repository';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagDto } from './dto/tag.dto';
import { FilterTagDto, SortTagDto } from './dto/query-tag.dto';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { TagPaginationDto } from './dto/tag-pagination.dto';

@Injectable()
export class TagService {
  constructor(private readonly tagRepository: TagRepository) {}

  async create(dto: CreateTagDto): Promise<TagDto> {
    const tag = await this.tagRepository.create(dto);
    return tag;
  }

  async update(
    id: number,
    tagDto: UpdateTagDto,
  ): Promise<NullableType<TagDto>> {
    const currentTag = await this.tagRepository.findById(id);

    if (!currentTag) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          tag: 'tagNotFound',
        },
      });
    }

    if (currentTag && currentTag.isCondition === true) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          tag: 'tagIsCondition',
        },
      });
    }
    const tag = await this.tagRepository.update(id, tagDto);
    return tag;
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
    return this.tagRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findById(id: number): Promise<NullableType<TagDto>> {
    return this.tagRepository.findById(id);
  }

  async softDelete(ids: number[]): Promise<void> {
    await this.tagRepository.remove(ids);
  }

  async updateStatus(ids: number[], status: number): Promise<void> {
    await this.tagRepository.updateMany(ids, { status });
  }
}
