import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734872777733 implements MigrationInterface {
    name = 'Migration1734872777733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" integer NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "statusId" integer, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_a01a568fbbff540189390c77704" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_a01a568fbbff540189390c77704"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
