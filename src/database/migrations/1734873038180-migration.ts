import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734873038180 implements MigrationInterface {
    name = 'Migration1734873038180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "categories_id_seq" OWNED BY "categories"."id"`);
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "id" SET DEFAULT nextval('"categories_id_seq"')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "categories_id_seq"`);
    }

}
