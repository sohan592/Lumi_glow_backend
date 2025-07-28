import { registerAs } from '@nestjs/config';

export const fileConfig = registerAs('file', () => ({
  driver: 'local',
  uploadDir: './uploads',
  tempDir: './uploads/temp',
  serveRoot: '/uploads',
}));
