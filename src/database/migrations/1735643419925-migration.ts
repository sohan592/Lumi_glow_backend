import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735643419925 implements MigrationInterface {
    name = 'Migration1735643419925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9f589f7148c56de6918a34e94a7"`);
        await queryRunner.query(`ALTER TABLE "product_gallery_images" DROP CONSTRAINT "FK_dd98a376d9e77ee4000e9ce79e6"`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9f589f7148c56de6918a34e94a7" FOREIGN KEY ("featureImageId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_gallery_images" ADD CONSTRAINT "FK_dd98a376d9e77ee4000e9ce79e6" FOREIGN KEY ("media_id") REFERENCES "medias"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_gallery_images" DROP CONSTRAINT "FK_dd98a376d9e77ee4000e9ce79e6"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9f589f7148c56de6918a34e94a7"`);
        await queryRunner.query(`ALTER TABLE "product_gallery_images" ADD CONSTRAINT "FK_dd98a376d9e77ee4000e9ce79e6" FOREIGN KEY ("media_id") REFERENCES "medias"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9f589f7148c56de6918a34e94a7" FOREIGN KEY ("featureImageId") REFERENCES "medias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
