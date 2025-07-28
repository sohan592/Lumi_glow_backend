import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736256036871 implements MigrationInterface {
    name = 'Migration1736256036871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "photoId" TO "photo"`);
        await queryRunner.query(`CREATE TYPE "public"."checkouts_paymentmethod_enum" AS ENUM('cash', 'card', 'bank_transfer')`);
        await queryRunner.query(`CREATE TYPE "public"."checkouts_paymentstatus_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "checkouts" ("id" SERIAL NOT NULL, "orderNumber" character varying NOT NULL, "subtotal" numeric(10,2) NOT NULL, "shipping" numeric(10,2) NOT NULL, "discount" numeric(10,2) NOT NULL DEFAULT '0', "tax" numeric(10,2) NOT NULL, "total" numeric(10,2) NOT NULL, "paymentMethod" "public"."checkouts_paymentmethod_enum" NOT NULL DEFAULT 'cash', "paymentStatus" "public"."checkouts_paymentstatus_enum" NOT NULL DEFAULT 'pending', "paymentDetails" json, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "paidAt" TIMESTAMP, "canceledAt" TIMESTAMP, "refundedAt" TIMESTAMP, "user_id" integer, "billing_address_id" integer, "shipping_address_id" integer, "shipping_method_id" integer, "coupon_id" integer, "status_id" integer, CONSTRAINT "UQ_b226dbfa9b28fa95af863af1697" UNIQUE ("orderNumber"), CONSTRAINT "PK_5800730d89f4137fc18770e4d4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "checkout_items" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, "total" numeric(10,2) NOT NULL, "productSnapshot" json NOT NULL, "selectedAttributes" json, "checkout_id" integer, CONSTRAINT "PK_4e85ea25e399768c9fff1b0eb76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "photo"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "photo" character varying`);
        await queryRunner.query(`ALTER TABLE "checkouts" ADD CONSTRAINT "FK_24f9f28b7675d85d081881e32a3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkouts" ADD CONSTRAINT "FK_b2306ff57a35c2037738bd18d33" FOREIGN KEY ("billing_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkouts" ADD CONSTRAINT "FK_bbd74508bcc23eade0a7dcdb880" FOREIGN KEY ("shipping_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkouts" ADD CONSTRAINT "FK_dd8eacd0c74d7966932767f2697" FOREIGN KEY ("shipping_method_id") REFERENCES "shipping_methods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkouts" ADD CONSTRAINT "FK_89765c5e6e82798632611de4785" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkouts" ADD CONSTRAINT "FK_4ec0cf4b3ff65f3be24b491ee08" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkout_items" ADD CONSTRAINT "FK_760f2c99d498239fb84120aa81e" FOREIGN KEY ("checkout_id") REFERENCES "checkouts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkout_items" DROP CONSTRAINT "FK_760f2c99d498239fb84120aa81e"`);
        await queryRunner.query(`ALTER TABLE "checkouts" DROP CONSTRAINT "FK_4ec0cf4b3ff65f3be24b491ee08"`);
        await queryRunner.query(`ALTER TABLE "checkouts" DROP CONSTRAINT "FK_89765c5e6e82798632611de4785"`);
        await queryRunner.query(`ALTER TABLE "checkouts" DROP CONSTRAINT "FK_dd8eacd0c74d7966932767f2697"`);
        await queryRunner.query(`ALTER TABLE "checkouts" DROP CONSTRAINT "FK_bbd74508bcc23eade0a7dcdb880"`);
        await queryRunner.query(`ALTER TABLE "checkouts" DROP CONSTRAINT "FK_b2306ff57a35c2037738bd18d33"`);
        await queryRunner.query(`ALTER TABLE "checkouts" DROP CONSTRAINT "FK_24f9f28b7675d85d081881e32a3"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "photo"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "photo" uuid`);
        await queryRunner.query(`DROP TABLE "checkout_items"`);
        await queryRunner.query(`DROP TABLE "checkouts"`);
        await queryRunner.query(`DROP TYPE "public"."checkouts_paymentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."checkouts_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "photo" TO "photoId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f" FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
