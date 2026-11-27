import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * "Information not available": one common value for the mandatory fields that the client's master
 * data leaves empty.
 *
 *  - Action status and Activity status: the value is added to the Postgres enums (it is appended,
 *    so the existing values and the views that read them are untouched).
 *  - Action start year: the column becomes nullable; an empty year is "Information not available".
 *    (The activity years are already nullable.)
 *  - National strategy list: the value is added to the list in National configurations.
 *
 * The type of instrument list is not stored as an enum, so it needs no change in the database.
 *
 * Guarded so it can run before the application has created the tables (new database) and can run
 * twice.
 */
const VALUE = "Information not available";

export class InformationNotAvailable1795684618755 implements MigrationInterface {
  name = "InformationNotAvailable1795684618755";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const enumType of ["action_status_enum", "activity_status_enum"]) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${enumType}') THEN
            ALTER TYPE "${enumType}" ADD VALUE IF NOT EXISTS '${VALUE}';
          END IF;
        END $$;
      `);
    }

    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public."action"') IS NOT NULL THEN
          ALTER TABLE "action" ALTER COLUMN "startYear" DROP NOT NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public."reference_data"') IS NOT NULL THEN
          INSERT INTO "reference_data" ("listKey", "code", "label", "isActive")
          VALUES ('NATIONAL_STRATEGY_ANCHOR', '${VALUE}', '${VALUE}', true)
          ON CONFLICT ("listKey", "code") DO NOTHING;
        END IF;
      END $$;
    `);
  }

  /**
   * PostgreSQL cannot remove a value from an enum, so the two status values stay in the enums
   * (nothing can select them once the application is reverted). The list value is removed and the
   * start year of the actions becomes mandatory again, which needs every action to have a year.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public."reference_data"') IS NOT NULL THEN
          DELETE FROM "reference_data" WHERE "listKey" = 'NATIONAL_STRATEGY_ANCHOR' AND "code" = '${VALUE}';
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public."action"') IS NOT NULL THEN
          IF EXISTS (SELECT 1 FROM "action" WHERE "startYear" IS NULL) THEN
            RAISE EXCEPTION 'Cannot make action.startYear mandatory again: some actions have no start year (Information not available). Give them a year first.';
          END IF;
          ALTER TABLE "action" ALTER COLUMN "startYear" SET NOT NULL;
        END IF;
      END $$;
    `);
  }
}
