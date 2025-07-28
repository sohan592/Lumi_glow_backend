import { ProductEntity } from '@src/modules/products/entity/product.entity';
import { UserEntity } from '@src/modules/users/infrastructure/persistence/relational/entities/user.entity';
import { EntityHelper } from '@utils/entity-helper';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'carts' })
export class CartEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // false when item is checked out or removed

  @Column({ type: 'boolean', default: false })
  isWishlist: boolean; // true for wishlist items, false for cart items

  @Column({ type: 'jsonb', nullable: true })
  selectedAttributes?: {
    attributeId: number;
    valueId: number;
    value?: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
