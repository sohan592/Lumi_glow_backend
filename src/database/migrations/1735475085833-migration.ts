import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735475085833 implements MigrationInterface {
    name = 'Migration1735475085833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "medias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "alt" character varying(255), "mimeType" character varying(50), "size" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "createdById" integer, CONSTRAINT "UQ_0a401df7dc32bccf2cebbdea916" UNIQUE ("path"), CONSTRAINT "PK_f27321557a66cd4fae9bc1ed6e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "medias" ADD CONSTRAINT "FK_ecbd33c6762fa6ef3405054e137" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medias" DROP CONSTRAINT "FK_ecbd33c6762fa6ef3405054e137"`);
        await queryRunner.query(`DROP TABLE "medias"`);
    }

}
