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

@Entity('shipping_methods')
export class ShippingEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  internalName: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  displayName: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  charge: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @ManyToOne(() => StatusEntity)
  @JoinColumn({ name: 'statusId' })
  status: StatusEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
