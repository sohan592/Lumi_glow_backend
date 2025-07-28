import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735635820084 implements MigrationInterface {
    name = 'Migration1735635820084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" RENAME COLUMN "featureImage" TO "featureImageId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "featureImageId"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "featureImageId" uuid`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9f589f7148c56de6918a34e94a7" FOREIGN KEY ("featureImageId") REFERENCES "medias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9f589f7148c56de6918a34e94a7"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "featureImageId"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "featureImageId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "products" RENAME COLUMN "featureImageId" TO "featureImage"`);
    }

}
