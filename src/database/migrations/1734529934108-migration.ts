import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734529934108 implements MigrationInterface {
    name = 'Migration1734529934108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordCode" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordCodeExpires" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD "confirmationCode" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "confirmationCodeExpires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "confirmationCodeExpires"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "confirmationCode"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordCodeExpires"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordCode"`);
    }

}
