import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736415728212 implements MigrationInterface {
    name = 'Migration1736415728212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "shipping" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "shipping" DROP DEFAULT`);
    }

}
