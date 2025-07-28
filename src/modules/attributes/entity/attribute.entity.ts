import { ProductEntity } from '@src/modules/products/entity/product.entity';
import { StatusEntity } from '@src/modules/statuses/entity/status.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { AttributeValueEntity } from './attributeValue.entity';

@Entity({
  name: 'attributes',
})
export class AttributeEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  internalName: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  externalName: string;

  @Column({
    type: 'enum',
    enum: ['select', 'checkbox', 'radio', 'string'],
  })
  type: 'select' | 'checkbox' | 'radio' | 'string';

  @OneToMany(() => AttributeValueEntity, (value) => value.attribute, {
    cascade: true,
  })
  values: AttributeValueEntity[];

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => StatusEntity, { nullable: true })
  @JoinColumn()
  status?: StatusEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => ProductEntity, (product) => product.attributes, {
    onDelete: 'CASCADE',
  })
  products: ProductEntity[];
}
