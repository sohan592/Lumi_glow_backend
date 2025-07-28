import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736262407896 implements MigrationInterface {
    name = 'Migration1736262407896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "isDefault"`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "isDefaultShipping" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "isDefaultBilling" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "isDefaultBilling"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "isDefaultShipping"`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "isDefault" boolean NOT NULL DEFAULT false`);
    }

}
