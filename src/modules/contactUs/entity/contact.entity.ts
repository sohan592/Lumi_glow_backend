import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { StatusEntity } from '@src/modules/statuses/entity/status.entity';

@Entity('contacts')
export class ContactEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  subject: string;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  reply?: string;

  @ManyToOne(() => StatusEntity)
  @JoinColumn({ name: 'status_id' })
  status: StatusEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
