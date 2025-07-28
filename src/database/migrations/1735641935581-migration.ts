import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735641935581 implements MigrationInterface {
    name = 'Migration1735641935581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_gallery_images" ("product_id" integer NOT NULL, "media_id" uuid NOT NULL, CONSTRAINT "PK_24dd091314f9d2cf24a0e690d3f" PRIMARY KEY ("product_id", "media_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_87f01aff7fd093d8db07d3fe73" ON "product_gallery_images" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_dd98a376d9e77ee4000e9ce79e" ON "product_gallery_images" ("media_id") `);
        await queryRunner.query(`ALTER TABLE "product_gallery_images" ADD CONSTRAINT "FK_87f01aff7fd093d8db07d3fe73b" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_gallery_images" ADD CONSTRAINT "FK_dd98a376d9e77ee4000e9ce79e6" FOREIGN KEY ("media_id") REFERENCES "medias"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_gallery_images" DROP CONSTRAINT "FK_dd98a376d9e77ee4000e9ce79e6"`);
        await queryRunner.query(`ALTER TABLE "product_gallery_images" DROP CONSTRAINT "FK_87f01aff7fd093d8db07d3fe73b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dd98a376d9e77ee4000e9ce79e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87f01aff7fd093d8db07d3fe73"`);
        await queryRunner.query(`DROP TABLE "product_gallery_images"`);
    }

}
