import { EntityHelper } from '../../../utils/entity-helper';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'status',
})
export class StatusEntity extends EntityHelper {
  @PrimaryColumn()
  id: number;

  @Column()
  name?: string;
}
