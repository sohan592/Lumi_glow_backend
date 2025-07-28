import { StatusEntity } from '@src/modules/statuses/entity/status.entity';
import { EntityHelper } from '../../../utils/entity-helper';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from '@src/modules/products/entity/product.entity';

@Entity({
  name: 'categories',
})
export class CategoryEntity extends EntityHelper {
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

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];
}
