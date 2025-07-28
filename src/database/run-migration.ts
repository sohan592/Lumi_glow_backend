// src/database/run-migration.ts
import { AppDataSource } from './data-source';

async function runMigration() {
  try {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    console.log('Migrations have been run successfully');
  } catch (error) {
    console.error('Error running migrations', error);
  } finally {
    await AppDataSource.destroy();
  }
}

runMigration();
