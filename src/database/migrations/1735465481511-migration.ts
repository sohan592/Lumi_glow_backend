import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735465481511 implements MigrationInterface {
    name = 'Migration1735465481511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "slug" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug")`);
        await queryRunner.query(`CREATE INDEX "idx_slug" ON "products" ("slug") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_slug"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "UQ_464f927ae360106b783ed0b4106"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "slug"`);
    }

}
