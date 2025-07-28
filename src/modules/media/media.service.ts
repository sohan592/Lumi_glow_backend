import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaRepository } from './repositories/media.repository';
import { FileMetadataDto } from './dto/uploadMedia.dto';
import { MediaEntity } from './entity/file.entity';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    metadata?: FileMetadataDto,
    userId?: string,
  ): Promise<MediaEntity> {
    return this.mediaRepository.createOne(file, metadata, userId);
  }

  async uploadFiles(
    files: Express.Multer.File[],
    metadataArray?: FileMetadataDto[],
    userId?: string,
  ): Promise<MediaEntity[]> {
    return this.mediaRepository.createMany(files, metadataArray, userId);
  }

  async findById(id: string): Promise<MediaEntity> {
    const media = await this.mediaRepository.findOne({ id });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  async delete(id: string): Promise<void> {
    const media = await this.findById(id);
    // TODO: Add file system deletion logic here
    await this.mediaRepository.delete(id);
  }

  getFileUrl(path: string): string {
    const baseUrl = this.configService.get('app.backendDomain');
    return `${baseUrl}${path}`;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    roleId?: number,
  ): Promise<{ data: MediaEntity[]; count: number }> {
    return this.mediaRepository.findAll(page, limit, search, roleId);
  }
  async findByIds(ids: string[]): Promise<MediaEntity[]> {
    const mediaEntities = await this.mediaRepository.findByIds(ids);
    if (!mediaEntities.length) {
      throw new NotFoundException('No media found for the provided ids');
    }
    return mediaEntities;
  }

  async deleteByPath(pathLink: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ path: pathLink });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    await this.delete(media.id);
  }
}
