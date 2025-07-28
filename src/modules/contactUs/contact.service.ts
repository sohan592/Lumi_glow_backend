import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ContactRepository } from './repositories/contact.repository';
import {
  CreateContactDto,
  UpdateContactDto,
  QueryContactDto,
  FilterContactDto,
  SortContactDto,
} from './dto/contact.dto';
import { ContactEntity } from './entity/contact.entity';
import { IPaginationOptions } from '@utils/types/pagination-options';

@Injectable()
export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async create(dto: CreateContactDto): Promise<ContactEntity> {
    return this.contactRepository.create(dto);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterContactDto | null;
    sortOptions?: SortContactDto[] | null;
    paginationOptions: IPaginationOptions;
  }) {
    return this.contactRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findOne(id: number): Promise<ContactEntity> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundException('Contact message not found');
    }
    return contact;
  }

  async update(id: number, dto: UpdateContactDto): Promise<ContactEntity> {
    return this.contactRepository.update(id, dto);
  }

  async remove(ids: number[]): Promise<void> {
    return this.contactRepository.remove(ids);
  }

  async updateStatus(ids: number[], statusId: number): Promise<void> {
    return this.contactRepository.updateStatus(ids, statusId);
  }
}
