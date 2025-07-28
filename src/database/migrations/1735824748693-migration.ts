import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735824748693 implements MigrationInterface {
    name = 'Migration1735824748693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."coupons_discounttype_enum" AS ENUM('percentage', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "coupons" ("id" SERIAL NOT NULL, "campaignName" character varying(100) NOT NULL, "code" character varying(50) NOT NULL, "discountType" "public"."coupons_discounttype_enum" NOT NULL DEFAULT 'percentage', "discountValue" numeric(10,2) NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "maxUses" integer NOT NULL DEFAULT '-1', "maxUsesPerUser" integer NOT NULL DEFAULT '1', "minOrderAmount" numeric(10,2), "maxDiscountAmount" numeric(10,2), "description" text, "usageCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status_id" integer, CONSTRAINT "UQ_a3fba499091392a384c434fa3d0" UNIQUE ("campaignName"), CONSTRAINT "UQ_e025109230e82925843f2a14c48" UNIQUE ("code"), CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coupon_products" ("coupon_id" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "PK_e37d7a9483f4414d61a3fd392ab" PRIMARY KEY ("coupon_id", "product_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_edd5b3b5e912ada7e6d28277e2" ON "coupon_products" ("coupon_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4897e96fb4b70bd6ac1d4735ba" ON "coupon_products" ("product_id") `);
        await queryRunner.query(`CREATE TABLE "coupon_categories" ("coupon_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_dc4310e1d47f99b254a151b276f" PRIMARY KEY ("coupon_id", "category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4746aa0d652b072947823dbaf4" ON "coupon_categories" ("coupon_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c53cdd152a176ce12653afe1aa" ON "coupon_categories" ("category_id") `);
        await queryRunner.query(`ALTER TABLE "coupons" ADD CONSTRAINT "FK_c1524011cce639230966f70704b" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupon_products" ADD CONSTRAINT "FK_edd5b3b5e912ada7e6d28277e2c" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "coupon_products" ADD CONSTRAINT "FK_4897e96fb4b70bd6ac1d4735bae" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "coupon_categories" ADD CONSTRAINT "FK_4746aa0d652b072947823dbaf48" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "coupon_categories" ADD CONSTRAINT "FK_c53cdd152a176ce12653afe1aa6" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coupon_categories" DROP CONSTRAINT "FK_c53cdd152a176ce12653afe1aa6"`);
        await queryRunner.query(`ALTER TABLE "coupon_categories" DROP CONSTRAINT "FK_4746aa0d652b072947823dbaf48"`);
        await queryRunner.query(`ALTER TABLE "coupon_products" DROP CONSTRAINT "FK_4897e96fb4b70bd6ac1d4735bae"`);
        await queryRunner.query(`ALTER TABLE "coupon_products" DROP CONSTRAINT "FK_edd5b3b5e912ada7e6d28277e2c"`);
        await queryRunner.query(`ALTER TABLE "coupons" DROP CONSTRAINT "FK_c1524011cce639230966f70704b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c53cdd152a176ce12653afe1aa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4746aa0d652b072947823dbaf4"`);
        await queryRunner.query(`DROP TABLE "coupon_categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4897e96fb4b70bd6ac1d4735ba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_edd5b3b5e912ada7e6d28277e2"`);
        await queryRunner.query(`DROP TABLE "coupon_products"`);
        await queryRunner.query(`DROP TABLE "coupons"`);
        await queryRunner.query(`DROP TYPE "public"."coupons_discounttype_enum"`);
    }

}
