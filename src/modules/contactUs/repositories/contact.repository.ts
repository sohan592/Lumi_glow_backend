import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, ILike, In } from 'typeorm';
import { ContactEntity } from '../entity/contact.entity';
import {
  CreateContactDto,
  UpdateContactDto,
  FilterContactDto,
  SortContactDto,
} from '../dto/contact.dto';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { NullableType } from '@utils/types/nullable.type';

@Injectable()
export class ContactRepository {
  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepository: Repository<ContactEntity>,
  ) {}

  async create(dto: CreateContactDto): Promise<ContactEntity> {
    const contactEntity = this.contactRepository.create({
      ...dto,
      status: { id: 1 }, // Default pending status
    });

    return this.contactRepository.save(contactEntity);
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
    const where: FindOptionsWhere<ContactEntity> = {};

    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name.toLowerCase()}%`);
    }

    if (filterOptions?.email) {
      where.email = ILike(`%${filterOptions.email.toLowerCase()}%`);
    }

    if (filterOptions?.subject) {
      where.subject = ILike(`%${filterOptions.subject.toLowerCase()}%`);
    }

    if (filterOptions?.status?.length) {
      where.status = filterOptions.status.map((status) => ({
        id: Number(status.id),
      }));
    }

    const [entities, total] = await this.contactRepository.findAndCount({
      where,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: sortOptions?.length
        ? sortOptions.reduce(
            (acc, sort) => ({ ...acc, [sort.orderBy]: sort.order }),
            {},
          )
        : { id: 'DESC' },
      relations: ['status'],
    });

    return { data: entities, total };
  }

  async findById(id: number): Promise<NullableType<ContactEntity>> {
    return this.contactRepository.findOne({
      where: { id: Number(id) },
      relations: ['status'],
    });
  }

  async update(id: number, dto: UpdateContactDto): Promise<ContactEntity> {
    const contact = await this.findById(id);
    if (!contact) {
      throw new BadRequestException('Contact message not found');
    }

    Object.assign(contact, {
      ...dto,
      status: { id: dto.status },
    });

    return this.contactRepository.save(contact);
  }

  async remove(ids: number[]): Promise<void> {
    await this.contactRepository.delete({ id: In(ids) });
  }

  async updateStatus(ids: number[], statusId: number): Promise<void> {
    await this.contactRepository.update(
      { id: In(ids) },
      { status: { id: statusId } },
    );
  }
}
