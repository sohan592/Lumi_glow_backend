import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735032848645 implements MigrationInterface {
    name = 'Migration1735032848645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tags" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "statusId" integer, CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "UQ_b3aa10c29ea4e61a830362bd25a" UNIQUE ("slug"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "brands" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "statusId" integer, CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name"), CONSTRAINT "UQ_b15428f362be2200922952dc268" UNIQUE ("slug"), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."attributes_type_enum" AS ENUM('select', 'checkbox', 'radio', 'string')`);
        await queryRunner.query(`CREATE TABLE "attributes" ("id" SERIAL NOT NULL, "internalName" character varying(255) NOT NULL, "externalName" character varying(255) NOT NULL, "type" "public"."attributes_type_enum" NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "statusId" integer, CONSTRAINT "UQ_b6b5219546c26c2098f57318781" UNIQUE ("internalName"), CONSTRAINT "PK_32216e2e61830211d3a5d7fa72c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tags" ADD CONSTRAINT "FK_bac5fd90e4e1c410004004becad" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "FK_8ef3567bfed60d17d312d9b8455" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attributes" ADD CONSTRAINT "FK_33cb030d544ad4cbebfc2d7c991" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attributes" DROP CONSTRAINT "FK_33cb030d544ad4cbebfc2d7c991"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "FK_8ef3567bfed60d17d312d9b8455"`);
        await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "FK_bac5fd90e4e1c410004004becad"`);
        await queryRunner.query(`DROP TABLE "attributes"`);
        await queryRunner.query(`DROP TYPE "public"."attributes_type_enum"`);
        await queryRunner.query(`DROP TABLE "brands"`);
        await queryRunner.query(`DROP TABLE "tags"`);
    }

}
