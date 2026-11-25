import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * "Other - specify" text boxes: the text the user types when "Other" or "Others" is chosen in a
 * list, saved next to the list value.
 *
 * Only new, nullable columns are added, so no view has to be rebuilt and existing records keep
 * every value. Guarded so it can run before the application has created the tables (new database)
 * and can run twice.
 */
const COLUMNS: { table: string; column: string }[] = [
  { table: "activity", column: "nationalImplementingEntityOther" },
  { table: "activity", column: "internationalImplementingEntityOther" },
  { table: "programme", column: "natImplementorOther" },
  { table: "action", column: "natAnchorOther" },
  { table: "user", column: "organisationOther" },
  { table: "support", column: "pipelineStatusOther" },
];

export class OtherSpecifyText1795598218755 implements MigrationInterface {
  name = "OtherSpecifyText1795598218755";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const { table, column } of COLUMNS) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF to_regclass('public."${table}"') IS NOT NULL THEN
            ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" character varying;
          END IF;
        END $$;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const { table, column } of [...COLUMNS].reverse()) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF to_regclass('public."${table}"') IS NOT NULL THEN
            ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${column}";
          END IF;
        END $$;
      `);
    }
  }
}
