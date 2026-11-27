import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * TRAN-261: Activity form fields (columns only; activity views unchanged).
 */
export class ActivityFormUpdates1795900000000 implements MigrationInterface {
  name = "ActivityFormUpdates1795900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "gipActivityCode" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "gipProjectCode" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "gipNppCode" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "additionalFundingProposalNo" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "projectLocation" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "expectedUseImpactsResults" text`
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "ggaThematicTargets" character varying array`
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "ggaDimensionalTargets" character varying array`
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "ggaDomains" character varying array`
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD COLUMN IF NOT EXISTS "ggaPrioritySystems" character varying array`
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Columns retained; rollback not automated.
  }
}