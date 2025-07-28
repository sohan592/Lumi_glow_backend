import { registerAs } from '@nestjs/config';

import { IsEnum } from 'class-validator';
import validateConfig from '../../../utils/validate-config';
import { FileConfig, FileDriver } from './file-config.type';

class EnvironmentVariablesValidator {
  @IsEnum(FileDriver)
  FILE_DRIVER: FileDriver;
}

export default registerAs<FileConfig>('file', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    driver:
      (process.env.FILE_DRIVER as FileDriver | undefined) ?? FileDriver.LOCAL,
    maxFileSize: 5242880, // 5mb
  };
});
