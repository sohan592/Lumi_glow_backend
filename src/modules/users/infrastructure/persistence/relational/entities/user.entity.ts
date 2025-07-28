import { AddressEntity } from '@src/modules/address/entity/address.entity';
import { MediaEntity } from '@src/modules/media/entity/file.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthProvidersEnum } from '../../../../../../modules/auth/auth-providers.enum';
import { RoleEntity } from '../../../../../../modules/roles/entity/role.entity';
import { StatusEntity } from '../../../../../../modules/statuses/entity/status.entity';
import { EntityHelper } from '../../../../../../utils/entity-helper';
import { FaceAnalysisLog } from '@src/modules/face-analysis/entities/face-analysis.entity';

@Entity({
  name: 'user',
})
export class UserEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  // For "string | null" we need to use String type.
  // More info: https://github.com/typeorm/typeorm/issues/2567
  @Column({ type: String, unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: AuthProvidersEnum.EMAIL })
  provider: string;

  @Index()
  @Column({ type: String, nullable: true })
  socialId?: string | null;

  @Index()
  @Column({ type: String, nullable: true })
  firstName: string | null;

  @Index()
  @Column({ type: String, nullable: true })
  lastName: string | null;

  @Column({ type: String, nullable: true })
  photo?: string | null;

  // Fields for password reset code
  @Column({ nullable: true })
  resetPasswordCode?: string;

  @Column({ nullable: true })
  resetPasswordCodeExpires?: Date;

  // Fields for email confirmation code
  @Column({ nullable: true })
  confirmationCode?: string;

  @Column({ nullable: true })
  confirmationCodeExpires?: Date;

  @ManyToOne(() => RoleEntity, {
    eager: true,
  })
  role?: RoleEntity | null;

  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  status?: StatusEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => MediaEntity, (file) => file.createdBy)
  files: MediaEntity[];

  @OneToMany(() => FaceAnalysisLog, (file) => file.user)
  faceAnalysisLogs: FaceAnalysisLog[];

  @OneToMany(() => AddressEntity, (address) => address.user, {
    cascade: true, // Automatically save or update related addresses
  })
  addresses: AddressEntity[];
}
