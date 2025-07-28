import { IsImageMediaType } from '@src/decorators/image.decorator';
import { AttributeEntity } from '@src/modules/attributes/entity/attribute.entity';
import { BrandTableEntity } from '@src/modules/brands/entity/brand.entity';
import { CategoryEntity } from '@src/modules/categories/entity/category.entity';
import { MediaEntity } from '@src/modules/media/entity/file.entity';
import { StatusEntity } from '@src/modules/statuses/entity/status.entity';
import { TagEntity } from '@src/modules/tags/entity/tag.entity';
import { IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  BACK_ORDER = 'back_order',
  PRE_ORDER = 'pre_order',
}

@Entity('products')
@Index(['sku', 'barcode'])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  @IsOptional()
  @Index('idx_slug')
  slug?: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  @Index('idx_sku')
  sku: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsNotEmpty()
  @Index('idx_barcode')
  barcode: string;

  @ManyToOne(() => CategoryEntity, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @IsNotEmpty()
  category: CategoryEntity;

  @ManyToOne(() => BrandTableEntity, (brand) => brand.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @IsOptional()
  brand?: BrandTableEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @Min(0)
  @Index('idx_price')
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @Min(0)
  discountPrice?: number;

  @Column({ type: 'int' })
  @IsNotEmpty()
  @Min(0)
  @Index('idx_stock')
  totalStock: number;

  @Column({
    type: 'enum',
    enum: StockStatus,
    default: StockStatus.OUT_OF_STOCK,
  })
  @IsEnum(StockStatus)
  @Index('idx_stock_status')
  stockStatus: StockStatus;

  @ManyToOne(() => MediaEntity, (media) => media.featureImage, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @IsOptional()
  featureImage?: MediaEntity;

  @ManyToMany(() => TagEntity, (tag) => tag.products, {
    eager: false,
  })
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: TagEntity[];

  @ManyToMany(() => MediaEntity, (media) => media.galleryImages, {
    eager: false,
  })
  @JoinTable({
    name: 'product_gallery_images',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'media_id', referencedColumnName: 'id' },
  })
  @IsImageMediaType({ message: 'Gallery images must be image files' })
  galleryImages: MediaEntity[];

  @ManyToMany(() => AttributeEntity, (attribute) => attribute.products, {
    eager: false,
  })
  @JoinTable({
    name: 'product_attributes',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'attribute_id', referencedColumnName: 'id' },
  })
  attributes: AttributeEntity[];

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  highlights?: { title: string; description: string }[];

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string;

  @ManyToOne(() => StatusEntity)
  @JoinColumn()
  status: StatusEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
