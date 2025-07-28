import { Module } from '@nestjs/common';

import { FilesService } from './files.service';
import { FilePersistenceModule } from './infrastructure/persistence.module';
import { FilesLocalModule } from './infrastructure/uploader/files.module';

const infrastructureUploaderModule = FilesLocalModule;

@Module({
  imports: [FilePersistenceModule, infrastructureUploaderModule],
  providers: [FilesService],
  exports: [FilesService, FilePersistenceModule],
})
export class FilesModule {}
