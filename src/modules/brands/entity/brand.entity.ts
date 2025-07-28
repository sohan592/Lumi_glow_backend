import { StatusEntity } from '@src/modules/statuses/entity/status.entity';
import { EntityHelper } from '../../../utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from '@src/modules/products/entity/product.entity';

@Entity({
  name: 'brands',
})
export class BrandTableEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => StatusEntity)
  @JoinColumn()
  status: StatusEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProductEntity, (product) => product.brand, {
    onDelete: 'SET NULL',
  })
  products: ProductEntity[];
}
