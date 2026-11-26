import { AlignSectorEnums1795690000000 } from "./1795690000000-alignSectorEnums";
import { Sector } from "../enums/sector.enum";

const ALL = Object.values(Sector) as string[];
const OLD = ALL.slice(0, 14);

/** A query runner that answers the two catalogue queries and records every other statement. */
function fakeRunner(typeLabels: Record<string, string[]>) {
  const statements: string[] = [];
  const query = jest.fn(async (sql: string, params?: any[]) => {
    if (sql.includes("information_schema.columns")) {
      return Object.keys(typeLabels).map((type) => ({
        table_name: type.replace("_sector_enum", ""),
        column_name: "sector",
        udt_name: type,
      }));
    }
    if (sql.includes("FROM pg_enum")) {
      return (typeLabels[params![0]] ?? []).map((enumlabel) => ({ enumlabel }));
    }
    statements.push(sql.replace(/\s+/g, " ").trim());
    return [];
  });
  return { runner: { query } as any, statements };
}

const migration = new AlignSectorEnums1795690000000();

describe("AlignSectorEnums migration", () => {
  it("does nothing when every sector enum already matches the Sector enum, in order", async () => {
    const { runner, statements } = fakeRunner({
      action_sector_enum: ALL,
      activity_sector_enum: ALL,
      programme_sector_enum: ALL,
      project_sector_enum: ALL,
    });
    await migration.up(runner);
    expect(statements).toEqual([]);
  });

  it("does nothing on a new database where no sector column exists yet", async () => {
    const { runner, statements } = fakeRunner({});
    await migration.up(runner);
    expect(statements).toEqual([]);
  });

  it("drops the views first and recreates them after the enums, in the order used by UpdateAllViews", async () => {
    const { runner, statements } = fakeRunner({ action_sector_enum: OLD, activity_sector_enum: ALL });
    await migration.up(runner);

    const firstAlter = statements.findIndex((s) => s.startsWith("ALTER TYPE"));
    const firstCreateView = statements.findIndex((s) => s.startsWith("CREATE MATERIALIZED VIEW"));
    expect(statements.slice(0, 6)).toEqual([
      "DROP VIEW IF EXISTS annex_three_view",
      "DROP MATERIALIZED VIEW IF EXISTS report_five_view_entity",
      "DROP MATERIALIZED VIEW IF EXISTS action_view_entity",
      "DROP MATERIALIZED VIEW IF EXISTS programme_view_entity",
      "DROP MATERIALIZED VIEW IF EXISTS project_view_entity",
      "DROP MATERIALIZED VIEW IF EXISTS activity_view_entity",
    ]);
    expect(firstAlter).toBeGreaterThan(5);
    expect(firstCreateView).toBeGreaterThan(firstAlter);
    expect(statements.filter((s) => s.startsWith("CREATE MATERIALIZED VIEW")).map((s) => s.split(" ")[3])).toEqual([
      "activity_view_entity",
      "project_view_entity",
      "programme_view_entity",
      "action_view_entity",
      "report_five_view_entity",
    ]);
    expect(statements.some((s) => s.startsWith("CREATE VIEW annex_three_view"))).toBe(true);
    expect(statements.some((s) => s.includes("CREATE UNIQUE INDEX idx_action_view_entity_id"))).toBe(true);
  });

  it("recreates only the enums that differ, with every Sector value, and keeps the stored values", async () => {
    const { runner, statements } = fakeRunner({ action_sector_enum: OLD, activity_sector_enum: ALL });
    await migration.up(runner);

    expect(statements).toContain('ALTER TYPE "action_sector_enum" RENAME TO "action_sector_enum_old"');
    const create = statements.find((s) => s.startsWith('CREATE TYPE "action_sector_enum"'))!;
    for (const value of ALL) {
      expect(create).toContain(`'${value}'`);
    }
    expect(statements).toContain(
      'ALTER TABLE "action" ALTER COLUMN "sector" TYPE "action_sector_enum" USING "sector"::text::"action_sector_enum"'
    );
    expect(statements).toContain('DROP TYPE "action_sector_enum_old"');
    expect(statements.some((s) => s.includes('"activity_sector_enum"'))).toBe(false);
  });

  it("recreates an enum whose values are right but in a different order", async () => {
    const shuffled = [...ALL.slice(0, 12), ALL[13], ALL[12], ...ALL.slice(14)];
    const { runner, statements } = fakeRunner({ action_sector_enum: shuffled });
    await migration.up(runner);
    expect(statements).toContain('ALTER TYPE "action_sector_enum" RENAME TO "action_sector_enum_old"');
  });

  it("refuses, with a clear message, when the database holds a value that the Sector enum does not have", async () => {
    const { runner, statements } = fakeRunner({ action_sector_enum: [...OLD, "Mining"] });
    await expect(migration.up(runner)).rejects.toThrow(/Mining/);
    expect(statements).toEqual([]);
  });
});
