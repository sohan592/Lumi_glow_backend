import { EntityHelper } from '../../../../utils/entity-helper';
import {
  // typeorm decorators here
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'file' })
export class FileEntity extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  path: string;
}
