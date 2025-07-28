import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusEntity } from '../../../modules/statuses/entity/status.entity';
import { StatusEnum } from '../../../modules/statuses/statuses.enum';
import { Repository } from 'typeorm';

@Injectable()
export class StatusSeedService {
  constructor(
    @InjectRepository(StatusEntity)
    private repository: Repository<StatusEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.save([
        this.repository.create({
          id: StatusEnum.ACTIVE,
          name: 'ACTIVE',
        }),
        this.repository.create({
          id: StatusEnum.INACTIVE,
          name: 'INACTIVE',
        }),
      ]);
    }
  }
}
