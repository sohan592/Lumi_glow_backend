import { UserEntity } from '@src/modules/users/infrastructure/persistence/relational/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('face_analysis_logs')
export class FaceAnalysisLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  imageUrl: string;

  @Column({ type: 'json', nullable: true })
  preferredTags: string[];

  @Column({ type: 'json', nullable: true })
  analysisResults: object; // Store the full analysis result

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  errorMessage: string; // Optional: Store any error message

  @Column()
  userId: number; // Store the userId who performed the analysis

  @ManyToOne(() => UserEntity, (user) => user.faceAnalysisLogs)
  @JoinColumn({ name: 'userId' })
  user: UserEntity; // Relation to User entity
}
