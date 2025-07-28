import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';
import { FileConfig, FileDriver } from '../config/file-config.type';
import fileConfig from '../config/file.config';

import { AppConfig } from '../../../config/app-config.type';
import appConfig from '../../../config/app.config';

export class FileType {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @Allow()
  id: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/path/to/file.jpg',
  })
  @Transform(
    ({ value }) => {
      if ((fileConfig() as FileConfig).driver === FileDriver.LOCAL) {
        return (appConfig() as AppConfig).backendDomain + value;
      }
      return value;
    },
    {
      toPlainOnly: true,
    },
  )
  path: string;
}
