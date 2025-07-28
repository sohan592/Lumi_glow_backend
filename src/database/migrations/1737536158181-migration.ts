import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1737536158181 implements MigrationInterface {
    name = 'Migration1737536158181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "deletedAt"`);
    }

}
