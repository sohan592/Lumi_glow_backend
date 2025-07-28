import { UserEntity } from '@src/modules/users/infrastructure/persistence/relational/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  BILLING = 'billing',
  SHIPPING = 'shipping',
  OTHER = 'other',
}

@Entity('addresses')
export class AddressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.addresses, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column({ type: 'enum', enum: AddressType, default: AddressType.HOME })
  type: AddressType;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255 })
  addressLine1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine2?: string;

  @Column({ type: 'varchar', length: 100 })
  region: string; // Single field for city/region/district

  @Column({ type: 'varchar', length: 255, nullable: true })
  landmark?: string; // Optional landmark

  @Column({ type: 'boolean', default: false })
  isDefaultShipping: boolean;

  @Column({ type: 'boolean', default: false })
  isDefaultBilling: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
