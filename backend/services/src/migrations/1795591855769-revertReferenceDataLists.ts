import { MigrationInterface, QueryRunner } from "typeorm";
import { actionViewSQL } from "../entities/action.view.entity";
import { activityViewSQL } from "../entities/activity.view.entity";
import { annexThreeReportSQL } from "../entities/annexThree.view.entity";
import { programmeViewSQL } from "../entities/programme.view.entity";
import { projectViewSQL } from "../entities/project.view.entity";
import { reportFiveViewSQL } from "../entities/report.five.view.entity";

/**
 * Puts the database back to the state it had before the "National configurations" release
 * (migrations CreateReferenceData1795081363889 and MoveListsToReferenceData1795150141268).
 *
 * What it does, in order:
 *  1. drops the views that read the columns that change type,
 *  2. turns the five columns that were Postgres enums back into enums. Values that the enum does
 *     not have (for example a Vanuatu-only organisation) are set to NULL, and the number of rows
 *     cleared per column is written to the log,
 *  3. renames the national strategy value NSDP back to NDP on existing actions,
 *  4. drops the reference_data table,
 *  5. forgets the two forward migrations, so they run again if that release is deployed later,
 *  6. recreates the views.
 *
 * Runs before the schema synchronisation on start-up, so the old entities find the enum columns
 * they expect. It does nothing on a database that never had those migrations applied (a new,
 * empty database).
 *
 * It cannot be reversed: the values removed in step 2 are gone.
 */

const FORWARD_MIGRATIONS = [
  "CreateReferenceData1795081363889",
  "MoveListsToReferenceData1795150141268",
];

// The enum values are written out here (not imported) so that this migration keeps its meaning if
// the enum files change later.
const ENUM_COLUMNS: { table: string; column: string; type: string; values: string[] }[] = [
  {
    table: "support",
    column: "internationalSupportChannel",
    type: "support_internationalsupportchannel_enum",
    values: ["Multilateral", "Bilateral", "Regional", "Other"],
  },
  {
    table: "support",
    column: "internationalFinancialInstrument",
    type: "support_internationalfinancialinstrument_enum",
    values: [
      "Grant",
      "Concessional Loan",
      "Non-concessional Loan",
      "Equity",
      "Guarantee",
      "Insurance",
      "Others",
    ],
  },
  {
    table: "support",
    column: "nationalFinancialInstrument",
    type: "support_nationalfinancialinstrument_enum",
    values: [
      "Grant",
      "Equity",
      "Commercial Bonds (private sector)",
      "Commercial Loan (private sector)",
      "National Budget",
      "National Fiscal Policy",
      "National Monetary Policy",
      "Others",
    ],
  },
  {
    table: "activity",
    column: "technologyType",
    type: "activity_technologytype_enum",
    values: [
      "Energy Efficiency",
      "Renewable Energy",
      "Emissions Abatement",
      "Nature Based Solution",
      "Carbon Storage",
      "IT Solutions",
      "Systems Management",
      "Resilience",
      "Coastal Management",
      "Civil",
      "Other",
    ],
  },
  {
    table: "user",
    column: "organisation",
    type: "user_organisation_enum",
    values: [
      "Ministry of Fisheries",
      "Ministry of Finance, Economic Planning & Trade",
      "Ministry of Foreign Affairs and Tourism",
      "Ministry of Internal Affairs",
      "Ministry of Transport",
      "Ministry of Health",
      "Ministry of Lands and Housing",
      "Ministry of Youth, Sports and Family",
      "Ministry of Investment, Entrepreneurship and Industry",
      "Ministry of Local Government and Community Affairs",
      "Ministry of Agriculture, Climate Change and Environment",
      "Ministry of Education",
      "Ministry of Employment and Social Affairs",
    ],
  },
];

const TABLES_NEEDED = ["action", "programme", "project", "activity", "support", "user"];

export class RevertReferenceDataLists1795591855769 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // A new, empty database has no tables yet (the schema is created after the migrations).
    for (const table of TABLES_NEEDED) {
      if (!(await this.tableExists(queryRunner, table))) {
        await this.forgetForwardMigrations(queryRunner);
        return;
      }
    }

    // 1. Views that read the columns that change type.
    await this.dropViews(queryRunner);

    // 2. Varchar columns become enums again.
    for (const { table, column, type, values } of ENUM_COLUMNS) {
      await this.convertToEnum(queryRunner, table, column, type, values);
    }

    // 3. NSDP goes back to NDP.
    await queryRunner.query(
      `UPDATE "action" SET "natAnchor" = array_replace("natAnchor", 'NSDP', 'NDP') WHERE 'NSDP' = ANY("natAnchor")`
    );

    // 4. The list table.
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reference_data_list_code"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reference_data"`);

    // 5. The forward migrations run again if that release is deployed later.
    await this.forgetForwardMigrations(queryRunner);

    // 6. Views again.
    await this.createViews(queryRunner);
  }

  public async down(): Promise<void> {
    throw new Error(
      "RevertReferenceDataLists cannot be reversed: values that the enums did not have were cleared."
    );
  }

  private async tableExists(queryRunner: QueryRunner, table: string): Promise<boolean> {
    const rows: { found: string | null }[] = await queryRunner.query(
      `SELECT to_regclass($1) AS found`,
      [`"${table}"`]
    );
    return rows[0]?.found != null;
  }

  private async forgetForwardMigrations(queryRunner: QueryRunner) {
    if (!(await this.tableExists(queryRunner, "migrations"))) {
      return;
    }
    await queryRunner.query(`DELETE FROM "migrations" WHERE "name" = ANY($1::text[])`, [
      FORWARD_MIGRATIONS,
    ]);
  }

  private async convertToEnum(
    queryRunner: QueryRunner,
    table: string,
    column: string,
    enumType: string,
    values: string[]
  ) {
    const rows: { data_type: string }[] = await queryRunner.query(
      `SELECT data_type FROM information_schema.columns
       WHERE table_schema = current_schema() AND table_name = $1 AND column_name = $2`,
      [table, column]
    );
    if (rows.length === 0 || rows[0].data_type === "USER-DEFINED") {
      return; // the column does not exist, or it is already an enum
    }

    const cleared: { n: number }[] = await queryRunner.query(
      `WITH cleared AS (
         UPDATE "${table}" SET "${column}" = NULL
         WHERE "${column}" IS NOT NULL AND "${column}"::text <> ALL($1::text[])
         RETURNING 1
       )
       SELECT count(*)::int AS n FROM cleared`,
      [values]
    );
    if (cleared[0].n > 0) {
      console.log(
        `RevertReferenceDataLists: cleared ${cleared[0].n} value(s) of ${table}.${column} that the old list does not have`
      );
    }

    const quoted = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(", ");
    await queryRunner.query(`DROP TYPE IF EXISTS "${enumType}"`);
    await queryRunner.query(`CREATE TYPE "${enumType}" AS ENUM (${quoted})`);
    await queryRunner.query(
      `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE "${enumType}" USING "${column}"::text::"${enumType}"`
    );
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
