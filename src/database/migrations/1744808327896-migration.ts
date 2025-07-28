import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744808327896 implements MigrationInterface {
    name = 'Migration1744808327896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "face_analysis_logs" ("id" SERIAL NOT NULL, "imageUrl" character varying(255) NOT NULL, "preferredTags" json, "analysisResults" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "errorMessage" character varying(255), "userId" integer NOT NULL, CONSTRAINT "PK_7888af44cda299f1f3cbbd7d8b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "face_analysis_logs" ADD CONSTRAINT "FK_f8936f8508b29fcb17f6e524e5e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "face_analysis_logs" DROP CONSTRAINT "FK_f8936f8508b29fcb17f6e524e5e"`);
        await queryRunner.query(`DROP TABLE "face_analysis_logs"`);
    }

}
