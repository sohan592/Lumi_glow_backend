import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736415595198 implements MigrationInterface {
    name = 'Migration1736415595198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "subtotal" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "tax" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "total" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "total" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "tax" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "subtotal" DROP DEFAULT`);
    }

}
