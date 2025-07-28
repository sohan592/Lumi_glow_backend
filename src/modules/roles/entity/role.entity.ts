import { EntityHelper } from '../../../utils/entity-helper';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'role',
})
export class RoleEntity extends EntityHelper {
  @PrimaryColumn()
  id: number;

  @Column()
  name?: string;
}
