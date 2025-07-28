import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1745320476683 implements MigrationInterface {
    name = 'Migration1745320476683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" ADD "isCondition" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "isCondition"`);
    }

}
