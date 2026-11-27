import { MigrationInterface, QueryRunner } from "typeorm";
import { actionViewSQL } from "../entities/action.view.entity";
import { activityViewSQL } from "../entities/activity.view.entity";
import { annexThreeReportSQL } from "../entities/annexThree.view.entity";
import { programmeViewSQL } from "../entities/programme.view.entity";
import { projectViewSQL } from "../entities/project.view.entity";
import { reportFiveViewSQL } from "../entities/report.five.view.entity";
import { Sector } from "../enums/sector.enum";

/**
 * Makes the Postgres sector enums (action, activity, programme and project) hold exactly the values
 * of the `Sector` enum, in the same order.
 *
 * Why: the application synchronises the schema when it starts. When the enum in the database differs
 * from the one in the entity (for example the Vanuatu sectors that TRAN-257 added), TypeORM tries to
 * `ALTER TABLE ... ALTER COLUMN "sector" TYPE ...`, which PostgreSQL refuses while a view reads the
 * column ("cannot alter type of a column used by a view or rule"), so the application cannot start.
 *
 * What it does, only when an enum differs (otherwise it does nothing):
 *  1. drops the views that read these columns (same order as `UpdateAllViews1763982449636`),
 *  2. recreates each differing enum with the `Sector` values and converts the column, keeping every
 *     stored value,
 *  3. recreates the views, which are populated again from the existing data,
 *  4. recreates the view indexes.
 *
 * Safe on a database that already has the values (nothing to do), on one that only got them through
 * `ALTER TYPE ... ADD VALUE` (nothing to do when the order already matches), on one that has the old
 * values only, and on a new database where the tables do not exist yet. Safe to run twice.
 */
const SECTOR_VALUES: string[] = Object.values(Sector);

const SECTOR_TABLES = ["action", "activity", "programme", "project"];

interface SectorEnumColumn {
  table: string;
  column: string;
  type: string;
  labels: string[];
}

const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;
const literal = (value: string) => `'${value.replace(/'/g, "''")}'`;

export class AlignSectorEnums1795690000000 implements MigrationInterface {
  name = "AlignSectorEnums1795690000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = await this.findSectorEnumColumns(queryRunner);
    const differing = columns.filter((c) => !this.sameLabels(c.labels, SECTOR_VALUES));
    if (differing.length === 0) {
      return;
    }

    for (const c of differing) {
      const unknown = c.labels.filter((label) => !SECTOR_VALUES.includes(label));
      if (unknown.length > 0) {
        throw new Error(
          `Cannot align ${c.type}: the database has values that the Sector enum does not have (${unknown.join(", ")})`
        );
      }
    }

    await this.dropViews(queryRunner);

    for (const c of differing) {
      const tmp = `${c.type}_old`;
      await queryRunner.query(`ALTER TYPE ${quote(c.type)} RENAME TO ${quote(tmp)}`);
      await queryRunner.query(
        `CREATE TYPE ${quote(c.type)} AS ENUM (${SECTOR_VALUES.map(literal).join(", ")})`
      );
      await queryRunner.query(
        `ALTER TABLE ${quote(c.table)} ALTER COLUMN ${quote(c.column)} TYPE ${quote(c.type)} USING ${quote(c.column)}::text::${quote(c.type)}`
      );
      await queryRunner.query(`DROP TYPE ${quote(tmp)}`);
    }

    await this.createViews(queryRunner);
  }

  /**
   * A PostgreSQL enum cannot be put back to the previous list without knowing it, and the extra
   * sectors are harmless to older code, so nothing is reverted.
   */
  public async down(_queryRunner: QueryRunner): Promise<void> {}

  private sameLabels(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((label, i) => label === b[i]);
  }

  /** The sector columns that are a Postgres enum, with the values of their enum in order. */
  private async findSectorEnumColumns(queryRunner: QueryRunner): Promise<SectorEnumColumn[]> {
    const rows: { table_name: string; column_name: string; udt_name: string }[] = await queryRunner.query(
      `SELECT table_name, column_name, udt_name
       FROM information_schema.columns
       WHERE table_schema = current_schema()
         AND column_name = 'sector'
         AND data_type = 'USER-DEFINED'
         AND table_name = ANY($1::text[])`,
      [SECTOR_TABLES]
    );

    const columns: SectorEnumColumn[] = [];
    for (const row of rows) {
      const labels: { enumlabel: string }[] = await queryRunner.query(
        `SELECT e.enumlabel
         FROM pg_enum e
         JOIN pg_type t ON t.oid = e.enumtypid
         JOIN pg_namespace n ON n.oid = t.typnamespace AND n.nspname = current_schema()
         WHERE t.typname = $1
         ORDER BY e.enumsortorder`,
        [row.udt_name]
      );
      columns.push({
        table: row.table_name,
        column: row.column_name,
        type: row.udt_name,
        labels: labels.map((l) => l.enumlabel),
      });
    }
    return columns;
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
