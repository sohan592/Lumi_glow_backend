import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736002281564 implements MigrationInterface {
    name = 'Migration1736002281564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "rating" integer NOT NULL DEFAULT '0', "comment" text, "adminReply" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "product_id" integer, "status_id" integer, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shipping_methods" ("id" SERIAL NOT NULL, "internalName" character varying(100) NOT NULL, "displayName" character varying(100) NOT NULL, "charge" numeric(10,2) NOT NULL DEFAULT '0', "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "statusId" integer, CONSTRAINT "UQ_a6cec6b16b3bd7c74758b7de0ae" UNIQUE ("internalName"), CONSTRAINT "PK_5bee9dd62a8b72d6d9caabd63cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "contacts" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "subject" character varying NOT NULL, "message" text NOT NULL, "reply" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status_id" integer, CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_2a8dbe8cf1e943877aff24b7d10" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipping_methods" ADD CONSTRAINT "FK_89f5a0188451ecb584b34995322" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "FK_540f03b1ff3d0602e445d7748de" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "FK_540f03b1ff3d0602e445d7748de"`);
        await queryRunner.query(`ALTER TABLE "shipping_methods" DROP CONSTRAINT "FK_89f5a0188451ecb584b34995322"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_2a8dbe8cf1e943877aff24b7d10"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
        await queryRunner.query(`DROP TABLE "contacts"`);
        await queryRunner.query(`DROP TABLE "shipping_methods"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
    }

}
