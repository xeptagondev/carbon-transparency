import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * TRAN-260: replace the partial unique index on action.ndcReference (WHERE IS NOT NULL)
 * with a full unique index of the same name, matching ActionEntity.
 * Postgres already allows multiple NULLs in a unique column, so the WHERE was unused.
 *
 * Safe if 1795800000000 already created the non-partial index: drop + recreate is a no-op
 * for uniqueness. Needed for databases that applied the earlier partial version.
 */
export class AlignNdcReferenceUniqueIndex1795810000000 implements MigrationInterface {
  name = "AlignNdcReferenceUniqueIndex1795810000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_action_ndcReference"`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_action_ndcReference"
      ON "action" ("ndcReference")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_action_ndcReference"`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_action_ndcReference"
      ON "action" ("ndcReference")
      WHERE "ndcReference" IS NOT NULL
    `);
  }
}
