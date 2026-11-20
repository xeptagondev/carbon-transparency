import { MigrationInterface, QueryRunner } from "typeorm";
import { actionViewSQL } from "../entities/action.view.entity";
import { activityViewSQL } from "../entities/activity.view.entity";
import { annexThreeReportSQL } from "../entities/annexThree.view.entity";
import { programmeViewSQL } from "../entities/programme.view.entity";
import { projectViewSQL } from "../entities/project.view.entity";
import { reportFiveViewSQL } from "../entities/report.five.view.entity";
import { VANUATU_REFERENCE_DATA } from "./data/vanuatuReferenceData";

/**
 * Moves the enum-backed dropdown lists into the reference_data table ("National configurations")
 * and loads the Vanuatu values.
 *
 * What it does, in order:
 *  1. drops the views that read the columns that change type,
 *  2. turns the Postgres enum columns into plain varchar (existing values are kept as text),
 *  3. renames the national strategy value NDP to NSDP on existing actions,
 *  4. loads the Vanuatu values of every list,
 *  5. keeps every value that existing records already use but that is not in the Vanuatu list, so
 *     those records keep showing it: disabled (hidden from new selections) on full-edit lists, and
 *     active on add-only lists, whose existing values may not be removed,
 *  6. recreates the views.
 *
 * Safe to run on a database where the columns are already varchar (a fresh database created by
 * schema synchronisation) and safe to run twice.
 *
 * Deployment note: on a database that holds data, run this migration BEFORE starting the new
 * application version. The application synchronises the schema on start-up, and TypeORM would
 * otherwise recreate the five changed columns (losing their values) instead of converting them.
 */

// Columns that were Postgres enums.
const ENUM_COLUMNS: { table: string; column: string }[] = [
  { table: "support", column: "internationalSupportChannel" },
  { table: "support", column: "internationalFinancialInstrument" },
  { table: "support", column: "nationalFinancialInstrument" },
  { table: "activity", column: "technologyType" },
  { table: "user", column: "organisation" },
];

// Where the stored values of each list live (arrays are varchar[], the others varchar).
const LIST_SOURCES: Record<string, { table: string; column: string; isArray: boolean }[]> = {
  INTERNATIONAL_SOURCE: [{ table: "support", column: "internationalSource", isArray: true }],
  SUB_SECTOR: [{ table: "programme", column: "affectedSubSector", isArray: true }],
  NATIONAL_IMPLEMENTING_ENTITY: [
    { table: "programme", column: "natImplementor", isArray: true },
    { table: "activity", column: "nationalImplementingEntity", isArray: true },
  ],
  INTERNATIONAL_IMPLEMENTING_ENTITY: [
    { table: "activity", column: "internationalImplementingEntity", isArray: true },
  ],
  RECIPIENT_ENTITY: [{ table: "activity", column: "recipientEntities", isArray: true }],
  USER_ORGANISATION: [{ table: "user", column: "organisation", isArray: false }],
  CHANNEL_OF_SUPPORT: [{ table: "support", column: "internationalSupportChannel", isArray: false }],
  INTERNATIONAL_FINANCIAL_INSTRUMENT: [
    { table: "support", column: "internationalFinancialInstrument", isArray: false },
  ],
  NATIONAL_FINANCIAL_INSTRUMENT: [
    { table: "support", column: "nationalFinancialInstrument", isArray: false },
  ],
  TYPE_OF_TECHNOLOGY: [{ table: "activity", column: "technologyType", isArray: false }],
  NATIONAL_STRATEGY_ANCHOR: [{ table: "action", column: "natAnchor", isArray: true }],
};

// Lists whose existing values may not be renamed or disabled (UNFCCC reporting depends on them).
const ADD_ONLY_LISTS = [
  "CHANNEL_OF_SUPPORT",
  "INTERNATIONAL_FINANCIAL_INSTRUMENT",
  "NATIONAL_FINANCIAL_INSTRUMENT",
  "TYPE_OF_TECHNOLOGY",
  "NATIONAL_STRATEGY_ANCHOR",
];

export class MoveListsToReferenceData1795150141268 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Safety net: the table is normally created by the previous migration or by schema synchronisation.
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

    // 1. Views that read the columns that change type (same order as the earlier view migrations).
    await this.dropViews(queryRunner);

    // 2. Enum columns become varchar.
    for (const { table, column } of ENUM_COLUMNS) {
      await this.convertEnumColumn(queryRunner, table, column);
    }

    // 3. NDP is now called NSDP (National Sustainable Development Plan).
    await queryRunner.query(
      `UPDATE "action" SET "natAnchor" = array_replace("natAnchor", 'NDP', 'NSDP') WHERE 'NDP' = ANY("natAnchor")`
    );

    // 4. Vanuatu values.
    for (const [listKey, values] of Object.entries(VANUATU_REFERENCE_DATA)) {
      await queryRunner.query(
        `INSERT INTO "reference_data" ("listKey", "code", "label", "isActive")
         SELECT $1::text, v, v, true FROM unnest($2::text[]) AS v
         ON CONFLICT ("listKey", "code") DO NOTHING`,
        [listKey, values]
      );
    }

    // 5. Values that existing records use and the Vanuatu list does not have.
    for (const [listKey, sources] of Object.entries(LIST_SOURCES)) {
      const isActive = ADD_ONLY_LISTS.includes(listKey);
      for (const { table, column, isArray } of sources) {
        const valueSelect = isArray
          ? `SELECT unnest("${column}") AS v FROM "${table}"`
          : `SELECT "${column}"::text AS v FROM "${table}"`;
        await queryRunner.query(
          `INSERT INTO "reference_data" ("listKey", "code", "label", "isActive")
           SELECT DISTINCT $1::text, v, v, $2::boolean FROM (${valueSelect}) AS s
           WHERE v IS NOT NULL AND v <> ''
           ON CONFLICT ("listKey", "code") DO NOTHING`,
          [listKey, isActive]
        );
      }
    }

    // 6. Views again.
    await this.createViews(queryRunner);
  }

  /**
   * The columns stay varchar: PostgreSQL enum types cannot be restored without knowing which values
   * to put back. This only removes what the migration loaded and restores the NDP name.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "action" SET "natAnchor" = array_replace("natAnchor", 'NSDP', 'NDP') WHERE 'NSDP' = ANY("natAnchor")`
    );
    const listKeys = Object.keys(VANUATU_REFERENCE_DATA);
    await queryRunner.query(`DELETE FROM "reference_data" WHERE "listKey" = ANY($1::text[])`, [listKeys]);
  }

  private async convertEnumColumn(queryRunner: QueryRunner, table: string, column: string) {
    const rows: { data_type: string; udt_name: string }[] = await queryRunner.query(
      `SELECT data_type, udt_name FROM information_schema.columns
       WHERE table_schema = current_schema() AND table_name = $1 AND column_name = $2`,
      [table, column]
    );
    if (rows.length === 0 || rows[0].data_type !== "USER-DEFINED") {
      return; // already varchar (or the column does not exist yet)
    }
    const enumType = rows[0].udt_name;
    await queryRunner.query(
      `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE character varying USING "${column}"::text`
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "${enumType}"`);
  }

  private async dropViews(queryRunner: QueryRunner) {
    await queryRunner.query(`DROP VIEW IF EXISTS annex_three_view`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS report_five_view_entity`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS action_view_entity`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS programme_view_entity`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS project_view_entity`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS activity_view_entity`);
  }

  private async createViews(queryRunner: QueryRunner) {
    await queryRunner.query("CREATE MATERIALIZED VIEW activity_view_entity AS" + "\n" + activityViewSQL);
    await queryRunner.query("CREATE MATERIALIZED VIEW project_view_entity AS" + "\n" + projectViewSQL);
    await queryRunner.query("CREATE MATERIALIZED VIEW programme_view_entity AS" + "\n" + programmeViewSQL);
    await queryRunner.query("CREATE MATERIALIZED VIEW action_view_entity AS" + "\n" + actionViewSQL);
    await queryRunner.query("CREATE MATERIALIZED VIEW report_five_view_entity AS" + "\n" + reportFiveViewSQL);
    await queryRunner.query("CREATE VIEW annex_three_view AS" + "\n" + annexThreeReportSQL);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_activity_view_entity_id ON activity_view_entity(id);
      CREATE UNIQUE INDEX idx_project_view_entity_id ON project_view_entity(id);
      CREATE UNIQUE INDEX idx_programme_view_entity_id ON programme_view_entity(id);
      CREATE UNIQUE INDEX idx_action_view_entity_id ON action_view_entity(id);
      CREATE UNIQUE INDEX idx_report_five_view_entity_id ON report_five_view_entity(source, "actionId");
    `);
  }
}
