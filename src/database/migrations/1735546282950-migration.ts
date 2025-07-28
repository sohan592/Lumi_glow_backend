import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735546282950 implements MigrationInterface {
    name = 'Migration1735546282950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_tags" DROP CONSTRAINT "FK_f2cd3faf2e129a4c69c05a291e8"`);
        await queryRunner.query(`ALTER TABLE "product_tags" ADD CONSTRAINT "FK_f2cd3faf2e129a4c69c05a291e8" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_tags" DROP CONSTRAINT "FK_f2cd3faf2e129a4c69c05a291e8"`);
        await queryRunner.query(`ALTER TABLE "product_tags" ADD CONSTRAINT "FK_f2cd3faf2e129a4c69c05a291e8" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
