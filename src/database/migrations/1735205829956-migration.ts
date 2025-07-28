import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735205829956 implements MigrationInterface {
    name = 'Migration1735205829956'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_images" ("id" SERIAL NOT NULL, "imageUrl" character varying(255) NOT NULL, "productId" integer, CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."products_stockstatus_enum" AS ENUM('in_stock', 'out_of_stock', 'back_order', 'pre_order')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "sku" character varying(100) NOT NULL, "barcode" character varying(50) NOT NULL, "price" numeric(10,2) NOT NULL, "discountPrice" numeric(10,2), "totalStock" integer NOT NULL, "stockStatus" "public"."products_stockstatus_enum" NOT NULL DEFAULT 'out_of_stock', "featureImage" character varying(255), "highlights" json, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "categoryId" integer, "brandId" integer, "statusId" integer, CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "UQ_adfc522baf9d9b19cd7d9461b7e" UNIQUE ("barcode"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `);
        await queryRunner.query(`CREATE INDEX "idx_sku" ON "products" ("sku") `);
        await queryRunner.query(`CREATE INDEX "idx_barcode" ON "products" ("barcode") `);
        await queryRunner.query(`CREATE INDEX "idx_price" ON "products" ("price") `);
        await queryRunner.query(`CREATE INDEX "idx_stock" ON "products" ("totalStock") `);
        await queryRunner.query(`CREATE INDEX "idx_stock_status" ON "products" ("stockStatus") `);
        await queryRunner.query(`CREATE INDEX "IDX_560a0d8dfd3ae835de032c22cd" ON "products" ("sku", "barcode") `);
        await queryRunner.query(`CREATE TABLE "product_tags" ("product_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_8ca809b37ff76596b63fe60ac41" PRIMARY KEY ("product_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5b0c6fc53c574299ecc7f9ee22" ON "product_tags" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f2cd3faf2e129a4c69c05a291e" ON "product_tags" ("tag_id") `);
        await queryRunner.query(`CREATE TABLE "product_attributes" ("product_id" integer NOT NULL, "attribute_id" integer NOT NULL, CONSTRAINT "PK_0ed9c9132de2a15eac4a4740df4" PRIMARY KEY ("product_id", "attribute_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f5a6700abd0494bae3032cf5bb" ON "product_attributes" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_183b4b4f99dc3ee5d28c5f8c5f" ON "product_attributes" ("attribute_id") `);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_b367708bf720c8dd62fc6833161" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ea86d0c514c4ecbb5694cbf57df" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_7058d9b9023bdc9defdaff50509" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_tags" ADD CONSTRAINT "FK_5b0c6fc53c574299ecc7f9ee22e" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_tags" ADD CONSTRAINT "FK_f2cd3faf2e129a4c69c05a291e8" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_f5a6700abd0494bae3032cf5bbd" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_183b4b4f99dc3ee5d28c5f8c5f0" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_183b4b4f99dc3ee5d28c5f8c5f0"`);
        await queryRunner.query(`ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_f5a6700abd0494bae3032cf5bbd"`);
        await queryRunner.query(`ALTER TABLE "product_tags" DROP CONSTRAINT "FK_f2cd3faf2e129a4c69c05a291e8"`);
        await queryRunner.query(`ALTER TABLE "product_tags" DROP CONSTRAINT "FK_5b0c6fc53c574299ecc7f9ee22e"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_7058d9b9023bdc9defdaff50509"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ea86d0c514c4ecbb5694cbf57df"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_b367708bf720c8dd62fc6833161"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_183b4b4f99dc3ee5d28c5f8c5f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f5a6700abd0494bae3032cf5bb"`);
        await queryRunner.query(`DROP TABLE "product_attributes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f2cd3faf2e129a4c69c05a291e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b0c6fc53c574299ecc7f9ee22"`);
        await queryRunner.query(`DROP TABLE "product_tags"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_560a0d8dfd3ae835de032c22cd"`);
        await queryRunner.query(`DROP INDEX "public"."idx_stock_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_stock"`);
        await queryRunner.query(`DROP INDEX "public"."idx_price"`);
        await queryRunner.query(`DROP INDEX "public"."idx_barcode"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sku"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_stockstatus_enum"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
    }

}
