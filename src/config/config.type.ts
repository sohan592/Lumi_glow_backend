import { DatabaseConfig } from '../database/config/database-config.type';
import { AppConfig } from './app-config.type';
import { FileConfig } from '../modules/files/config/file-config.type';
import { AuthConfig } from '../modules/auth/config/auth-config.type';
import { MailConfig } from '../modules/mail/config/mail-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  xdfsdfsf: AuthConfig;
  database: DatabaseConfig;
  file: FileConfig;
  mail: MailConfig;
};
