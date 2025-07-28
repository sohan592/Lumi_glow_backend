import { ProductEntity } from '@src/modules/products/entity/product.entity';
import { UserEntity } from '@src/modules/users/infrastructure/persistence/relational/entities/user.entity';
import { EntityHelper } from '@utils/entity-helper';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'medias' })
export class MediaEntity extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  path: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alt: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mimeType: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @ManyToOne(() => UserEntity, (user) => user.files)
  @JoinColumn({ name: 'createdById' })
  createdBy: UserEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToMany(() => ProductEntity, (product) => product.galleryImages, {
    onDelete: 'CASCADE',
  })
  galleryImages: ProductEntity[];

  @OneToMany(() => ProductEntity, (product) => product.featureImage)
  featureImage: ProductEntity[];
}
