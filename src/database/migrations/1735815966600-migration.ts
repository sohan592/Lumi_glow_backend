import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735815966600 implements MigrationInterface {
    name = 'Migration1735815966600'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."addresses_type_enum" AS ENUM('home', 'work', 'billing', 'shipping', 'other')`);
        await queryRunner.query(`CREATE TABLE "addresses" ("id" SERIAL NOT NULL, "type" "public"."addresses_type_enum" NOT NULL DEFAULT 'home', "fullName" character varying(255) NOT NULL, "phoneNumber" character varying(20) NOT NULL, "email" character varying(255), "addressLine1" character varying(255) NOT NULL, "addressLine2" character varying(255), "region" character varying(100) NOT NULL, "landmark" character varying(255), "isDefault" boolean NOT NULL DEFAULT false, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TYPE "public"."addresses_type_enum"`);
    }

}
