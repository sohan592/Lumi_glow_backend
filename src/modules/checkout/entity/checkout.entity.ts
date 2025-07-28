import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { UserEntity } from '@src/modules/users/infrastructure/persistence/relational/entities/user.entity';
import { AddressEntity } from '@src/modules/address/entity/address.entity';
import { ShippingEntity } from '@src/modules/shipping/entity/shipping.entity';
import { CouponEntity } from '@src/modules/coupons/entity/coupon.entity';
import { StatusEntity } from '@src/modules/statuses/entity/status.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  COD = 'cod',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('checkouts')
export class CheckoutEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => CheckoutItemEntity, (item) => item.checkout, {
    cascade: true,
  })
  items: CheckoutItemEntity[];

  @ManyToOne(() => AddressEntity)
  @JoinColumn({ name: 'billing_address_id' })
  billingAddress: AddressEntity;

  @ManyToOne(() => AddressEntity)
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: AddressEntity;

  @ManyToOne(() => ShippingEntity)
  @JoinColumn({ name: 'shipping_method_id' })
  shippingMethod: ShippingEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipping: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @ManyToOne(() => CouponEntity, { nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon?: CouponEntity;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'json', nullable: true })
  paymentDetails?: Record<string, any>;

  @ManyToOne(() => StatusEntity)
  @JoinColumn({ name: 'status_id' })
  status: StatusEntity;

  @Column({ type: 'text', nullable: true })
  lastStatusNote?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  canceledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date;
}

@Entity('checkout_items')
export class CheckoutItemEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CheckoutEntity, (checkout) => checkout.items)
  @JoinColumn({ name: 'checkout_id' })
  checkout: CheckoutEntity;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'json' })
  productSnapshot: {
    id: number;
    name: string;
    sku: string;
    image?: string;
    price: number;
    category: number;
  };

  @Column({ type: 'json', nullable: true })
  selectedAttributes?: {
    attributeId: number;
    valueId: number;
    value: string;
  }[];
}

@Entity('checkout_status_history')
export class CheckoutStatusHistoryEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CheckoutEntity)
  @JoinColumn({ name: 'checkout_id' })
  checkout: CheckoutEntity;

  @ManyToOne(() => StatusEntity)
  @JoinColumn({ name: 'status_id' })
  status: StatusEntity;

  @Column({ type: 'text', nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: UserEntity;
}
