import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  FileMetadataDto,
  UploadMultipleMediaDto,
} from '../dto/uploadMedia.dto';
import { MediaEntity } from '../entity/file.entity';
import { UserEntity } from '@src/modules/users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
  ) {}

  async createOne(
    file: Express.Multer.File,
    metadata?: FileMetadataDto,
    userId?: string,
  ): Promise<MediaEntity> {
    file.path = path.normalize(file.path).replace(/^uploads[/\\]/, '');
    const media = new MediaEntity();
    media.path = file.path;
    media.createdBy = userId ? ({ id: +userId } as UserEntity) : undefined;
    media.name = metadata?.name || file.originalname;
    media.alt = metadata?.alt;
    media.mimeType = file.mimetype;
    media.size = file.size;

    return this.mediaRepository.save(media);
  }

  async createMany(
    files: Express.Multer.File[],
    metadataArray?: FileMetadataDto[],
    userId?: string,
  ): Promise<MediaEntity[]> {
    const mediaEntities = files.map((file, index) => {
      file.path = path.normalize(file.path).replace(/^uploads[/\\]/, '');
      const metadata = metadataArray?.[index];
      const media = new MediaEntity();
      media.path = file.path;
      media.createdBy = userId ? ({ id: +userId } as UserEntity) : undefined;
      media.name = metadata?.name || file.originalname;
      media.alt = metadata?.alt;
      media.mimeType = file.mimetype;
      media.size = file.size;
      return media;
    });

    const data = this.mediaRepository.save(mediaEntities);
    return data;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    roleId?: number,
  ): Promise<{ data: MediaEntity[]; count: number }> {
    const queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.createdBy', 'createdBy');

    if (search) {
      queryBuilder.where('media.name LIKE :search OR media.alt LIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder.andWhere('createdBy.role = :role', { role: roleId ?? 1 });

    queryBuilder.orderBy('media.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, count] = await queryBuilder.getManyAndCount();

    return { data, count };
  }

  async findOne(
    where: FindOptionsWhere<MediaEntity>,
  ): Promise<MediaEntity | null> {
    return this.mediaRepository.findOne({ where });
  }

  async delete(id: string): Promise<void> {
    const media = await this.findOne({ id });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete physical file
    try {
      await fs.unlink(path.join(process.cwd(), `/uploads/${media.path}`));
    } catch (error) {
      console.error(`Failed to delete file: ${media.path}`, error);
    }

    await this.mediaRepository.remove(media);
  }

  async findByIds(ids: string[]): Promise<MediaEntity[]> {
    return this.mediaRepository.findBy({ id: In(ids) });
  }
}
