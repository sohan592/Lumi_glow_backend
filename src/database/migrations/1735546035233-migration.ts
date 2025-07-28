import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735546035233 implements MigrationInterface {
    name = 'Migration1735546035233'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_183b4b4f99dc3ee5d28c5f8c5f0"`);
        await queryRunner.query(`ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_183b4b4f99dc3ee5d28c5f8c5f0" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_183b4b4f99dc3ee5d28c5f8c5f0"`);
        await queryRunner.query(`ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_183b4b4f99dc3ee5d28c5f8c5f0" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
