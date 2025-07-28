import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from '../../products/entity/product.entity';
import { CategoryEntity } from '../../categories/entity/category.entity';
import { EntityHelper } from '../../../utils/entity-helper';
import { StatusEntity } from '@src/modules/statuses/entity/status.entity';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('coupons')
export class CouponEntity extends EntityHelper {
  @PrimaryGeneratedColumn() // Use UUID for better scalability
  id: number;

  @Column({ unique: true, length: 100 }) // Added length constraint
  campaignName: string;

  @Column({ unique: true, length: 50 }) // Added length constraint
  code: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
  })
  discountType: DiscountType;

  @Column('decimal', { precision: 10, scale: 2 })
  discountValue: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column('int', { default: -1 }) // -1 means unlimited
  maxUses: number;

  @Column('int', { default: 1 })
  maxUsesPerUser: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minOrderAmount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number;

  @ManyToMany(() => ProductEntity, { cascade: true, onDelete: 'SET NULL' }) // Added cascade
  @JoinTable({
    name: 'coupon_products',
    joinColumn: { name: 'coupon_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: ProductEntity[];

  @ManyToMany(() => CategoryEntity, { cascade: true, onDelete: 'SET NULL' }) // Added cascade
  @JoinTable({
    name: 'coupon_categories',
    joinColumn: { name: 'coupon_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: CategoryEntity[];

  @ManyToOne(() => StatusEntity, { cascade: true, onDelete: 'SET NULL' }) // Added cascade
  @JoinColumn({ name: 'status_id' })
  status: StatusEntity;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
