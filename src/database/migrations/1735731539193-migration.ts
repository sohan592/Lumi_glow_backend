import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735731539193 implements MigrationInterface {
    name = 'Migration1735731539193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "attribute_values" ("id" SERIAL NOT NULL, "value" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "attribute_id" integer, CONSTRAINT "PK_3babf93d1842d73e7ba849c0160" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attribute_values" ADD CONSTRAINT "FK_be02d0f6a15bc7a0d835f832b62" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attribute_values" DROP CONSTRAINT "FK_be02d0f6a15bc7a0d835f832b62"`);
        await queryRunner.query(`DROP TABLE "attribute_values"`);
    }

}
