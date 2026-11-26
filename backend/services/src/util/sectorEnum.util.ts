import { DataSource } from "typeorm";
import { Sector } from "../enums/sector.enum";

/** Labels appended to the original 14-value Postgres enums (TRAN-257). */
export const NEW_VANUATU_SECTOR_LABELS = [
  Sector.Livestock,
  Sector.Biosecurity,
  Sector.Fisheries,
  Sector.Oceans,
  Sector.Biodiversity,
  Sector.Waste,
  Sector.ResilientInfrastructure,
  Sector.Services,
  Sector.Tourism,
  Sector.SocialInclusion,
  Sector.Governance,
  Sector.ClimateInformation,
];

type QueryExecutor = {
  query: (sql: string, parameters?: any[]) => Promise<any>;
};

/**
 * ALTER TYPE ... ADD VALUE for each missing Vanuatu sector. Does not drop or recreate
 * the type, so views that read action.sector (e.g. report_five_view_entity) stay valid.
 */
export async function addMissingSectorEnumValues(executor: QueryExecutor): Promise<void> {
  const enumTypes: { udt_name: string }[] = await executor.query(`
    SELECT DISTINCT c.udt_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name IN ('action', 'programme', 'project', 'activity')
      AND c.column_name = 'sector'
      AND c.data_type = 'USER-DEFINED'
  `);

  for (const { udt_name: typeName } of enumTypes) {
    for (const label of NEW_VANUATU_SECTOR_LABELS) {
      const exists: { n: number }[] = await executor.query(
        `
        SELECT 1 AS n
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = $1 AND e.enumlabel = $2
        LIMIT 1
      `,
        [typeName, label]
      );
      if (exists.length > 0) {
        continue;
      }
      const safeType = typeName.replace(/"/g, '""');
      const safeLabel = label.replace(/'/g, "''");
      await executor.query(`ALTER TYPE "${safeType}" ADD VALUE '${safeLabel}'`);
    }
  }
}

async function hasCoreApplicationSchema(executor: QueryExecutor): Promise<boolean> {
  const rows: { exists: boolean }[] = await executor.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'user'
    ) AS exists
  `);
  return Boolean(rows[0]?.exists);
}

let patched = false;

/**
 * TypeORM synchronize on initialize recreates changed Postgres enums and fails when
 * materialized views use sector columns. Extend enums first; run sync only on a fresh DB.
 */
export function patchDataSourceToExtendSectorEnums(): void {
  if (patched) {
    return;
  }
  patched = true;

  const originalInitialize = DataSource.prototype.initialize;
  DataSource.prototype.initialize = async function (this: DataSource) {
    const shouldSync = this.options.synchronize === true;
    if (shouldSync) {
      this.setOptions({ synchronize: false });
    }
    await originalInitialize.call(this);
    await addMissingSectorEnumValues(this);
    if (shouldSync) {
      const schemaExists = await hasCoreApplicationSchema(this);
      if (!schemaExists) {
        await this.synchronize();
      }
    }
    return this;
  };
}