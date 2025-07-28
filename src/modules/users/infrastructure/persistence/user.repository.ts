import { IPaginationOptions } from '../../../../utils/types/pagination-options';
import { User } from '../../domain/user';

import { FilterUserDto, SortUserDto } from '../../dto/query-user.dto';
import { NullableType } from '../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../utils/types/deep-partial.type';

export abstract class UserRepository {
  abstract create(
    data: Omit<User, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<User>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<{ data: User[]; total: number }>;

  abstract findById(id: User['id']): Promise<NullableType<User>>;
  abstract findByIds(ids: User['id'][]): Promise<User[]>;
  // Add the new method signature
  abstract findByEmailAndConfirmationCode(
    email: string,
    confirmationCode: string,
  ): Promise<NullableType<User>>;

  abstract findByEmailAndResetPasswordCode(
    email: string,
    resetPasswordCode: string,
  ): Promise<NullableType<User>>;

  abstract findByEmail(email: User['email']): Promise<NullableType<User>>;
  abstract findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>>;

  abstract update(
    id: User['id'],
    payload: DeepPartial<User>,
  ): Promise<User | null>;

  abstract remove(id: User['id']): Promise<void>;
}
