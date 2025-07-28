import { StatusEntity } from '@src/modules/statuses/entity/status.entity';
import { EntityHelper } from '../../../utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from '@src/modules/products/entity/product.entity';

@Entity({
  name: 'tags',
})
export class TagEntity extends EntityHelper {
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

  //boolean column to indicate if the tag is a skin condition
  @Column({ type: 'boolean', default: false })
  isCondition: boolean;

  @ManyToOne(() => StatusEntity)
  @JoinColumn()
  status: StatusEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => ProductEntity, (product) => product.tags, {
    onDelete: 'CASCADE',
  })
  products: ProductEntity[];
}
