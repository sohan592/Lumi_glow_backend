import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1737362705696 implements MigrationInterface {
    name = 'Migration1737362705696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "checkout_status_history" ("id" SERIAL NOT NULL, "title" text, "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "checkout_id" integer, "status_id" integer, "created_by_id" integer, CONSTRAINT "PK_69d3f7fef0318f78107f4aacfc6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "checkout_status_history" ADD CONSTRAINT "FK_cb23861296e199c41b65cd4e3b7" FOREIGN KEY ("checkout_id") REFERENCES "checkouts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkout_status_history" ADD CONSTRAINT "FK_72a7ec85978e781ca05767a7ab6" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkout_status_history" ADD CONSTRAINT "FK_b4fdb6952b959fa9cc0ae05199a" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkout_status_history" DROP CONSTRAINT "FK_b4fdb6952b959fa9cc0ae05199a"`);
        await queryRunner.query(`ALTER TABLE "checkout_status_history" DROP CONSTRAINT "FK_72a7ec85978e781ca05767a7ab6"`);
        await queryRunner.query(`ALTER TABLE "checkout_status_history" DROP CONSTRAINT "FK_cb23861296e199c41b65cd4e3b7"`);
        await queryRunner.query(`DROP TABLE "checkout_status_history"`);
    }

}
