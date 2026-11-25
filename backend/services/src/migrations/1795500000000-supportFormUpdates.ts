import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Support form updates: a pipeline status for needed support, the national budget by year,
 * comments and documents.
 *
 * Only new, nullable columns are added, so no view has to be rebuilt and existing support
 * records keep every value. Guarded so it can run before the application has created the
 * table (new database) and can run twice.
 *
 * The old "nationalSource" column is deliberately kept: the form no longer writes it, but
 * records created earlier still hold it.
 */
export class SupportFormUpdates1795500000000 implements MigrationInterface {
  name = "SupportFormUpdates1795500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.support') IS NOT NULL THEN
          ALTER TABLE "support" ADD COLUMN IF NOT EXISTS "pipelineStatus" character varying;
          ALTER TABLE "support" ADD COLUMN IF NOT EXISTS "nationallyBudgetSupported" boolean;
          ALTER TABLE "support" ADD COLUMN IF NOT EXISTS "nationalBudgetAllocation" jsonb;
          ALTER TABLE "support" ADD COLUMN IF NOT EXISTS "nationalBudgetTotalDomestic" numeric(15,2);
          ALTER TABLE "support" ADD COLUMN IF NOT EXISTS "nationalBudgetTotal" numeric(15,2);
          ALTER TABLE "support" ADD COLUMN IF NOT EXISTS "comments" text;
          ALTER TABLE "support" ADD COLUMN IF NOT EXISTS "documents" jsonb;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.support') IS NOT NULL THEN
          ALTER TABLE "support" DROP COLUMN IF EXISTS "documents";
          ALTER TABLE "support" DROP COLUMN IF EXISTS "comments";
          ALTER TABLE "support" DROP COLUMN IF EXISTS "nationalBudgetTotal";
          ALTER TABLE "support" DROP COLUMN IF EXISTS "nationalBudgetTotalDomestic";
          ALTER TABLE "support" DROP COLUMN IF EXISTS "nationalBudgetAllocation";
          ALTER TABLE "support" DROP COLUMN IF EXISTS "nationallyBudgetSupported";
          ALTER TABLE "support" DROP COLUMN IF EXISTS "pipelineStatus";
        END IF;
      END $$;
    `);
  }
}
