import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736413718737 implements MigrationInterface {
    name = 'Migration1736413718737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkouts" ADD "lastStatusNote" text`);
        await queryRunner.query(`ALTER TYPE "public"."checkouts_paymentmethod_enum" RENAME TO "checkouts_paymentmethod_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."checkouts_paymentmethod_enum" AS ENUM('cash', 'card', 'bank_transfer', 'cod')`);
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "paymentMethod" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "paymentMethod" TYPE "public"."checkouts_paymentmethod_enum" USING "paymentMethod"::"text"::"public"."checkouts_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "paymentMethod" SET DEFAULT 'cash'`);
        await queryRunner.query(`DROP TYPE "public"."checkouts_paymentmethod_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."checkouts_paymentmethod_enum_old" AS ENUM('cash', 'card', 'bank_transfer')`);
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "paymentMethod" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "paymentMethod" TYPE "public"."checkouts_paymentmethod_enum_old" USING "paymentMethod"::"text"::"public"."checkouts_paymentmethod_enum_old"`);
        await queryRunner.query(`ALTER TABLE "checkouts" ALTER COLUMN "paymentMethod" SET DEFAULT 'cash'`);
        await queryRunner.query(`DROP TYPE "public"."checkouts_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."checkouts_paymentmethod_enum_old" RENAME TO "checkouts_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "checkouts" DROP COLUMN "lastStatusNote"`);
    }

}
