import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { FilesModule } from '../files/files.module';
import { UserPersistenceModule } from './infrastructure/persistence/relational/persistence.module';
import { UsersService } from './users.service';

@Module({
  imports: [
    // import modules, etc.
    UserPersistenceModule,
    FilesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, UserPersistenceModule],
})
export class UsersModule {}
