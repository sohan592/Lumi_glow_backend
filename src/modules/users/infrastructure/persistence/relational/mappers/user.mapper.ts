import { RoleEntity } from '../../../../../../modules/roles/entity/role.entity';
import { StatusEntity } from '../../../../../../modules/statuses/entity/status.entity';
import { User } from '../../../../../../modules/users/domain/user';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDomain(raw: UserEntity): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.provider = raw.provider;
    domainEntity.socialId = raw.socialId;
    domainEntity.firstName = raw.firstName;
    domainEntity.lastName = raw.lastName;
    domainEntity.photo = raw.photo;
    domainEntity.role = raw.role;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.addresses = raw.addresses;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    domainEntity.confirmationCode = raw.confirmationCode;
    domainEntity.confirmationCodeExpires = raw.confirmationCodeExpires;
    domainEntity.resetPasswordCode = raw.resetPasswordCode;
    domainEntity.resetPasswordCodeExpires = raw.resetPasswordCodeExpires;
    return domainEntity;
  }

  static toPersistence(domainEntity: User): UserEntity {
    let role: RoleEntity | undefined = undefined;

    if (domainEntity.role) {
      role = new RoleEntity();
      role.id = Number(domainEntity.role.id);
    }

    let status: StatusEntity | undefined = undefined;

    if (domainEntity.status) {
      status = new StatusEntity();
      status.id = Number(domainEntity.status.id);
    }

    const persistenceEntity = new UserEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.password = domainEntity.password;
    persistenceEntity.provider = domainEntity.provider;
    persistenceEntity.socialId = domainEntity.socialId;
    persistenceEntity.firstName = domainEntity.firstName;
    persistenceEntity.lastName = domainEntity.lastName;
    persistenceEntity.photo = domainEntity.photo;
    persistenceEntity.role = role;
    persistenceEntity.status = status;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    persistenceEntity.confirmationCode = domainEntity.confirmationCode;
    persistenceEntity.confirmationCodeExpires =
      domainEntity.confirmationCodeExpires;
    persistenceEntity.resetPasswordCode = domainEntity.resetPasswordCode;
    persistenceEntity.resetPasswordCodeExpires =
      domainEntity.resetPasswordCodeExpires;
    return persistenceEntity;
  }
}
