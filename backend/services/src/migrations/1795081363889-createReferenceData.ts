import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReferenceData1795081363889 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reference_data" (
        "id" SERIAL NOT NULL,
        "listKey" character varying NOT NULL,
        "code" character varying NOT NULL,
        "label" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_reference_data_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_reference_data_list_code"
      ON "reference_data" ("listKey", "code")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reference_data_list_code"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reference_data"`);
  }
}
