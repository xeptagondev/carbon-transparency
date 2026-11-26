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
 * ALTER TYPE ... ADD VALUE IF NOT EXISTS for each Vanuatu sector. Does not drop or
 * recreate the type, so views that read action.sector stay valid and existing rows keep
 * their sectors.
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
      const safeType = typeName.replace(/"/g, '""');
      const safeLabel = label.replace(/'/g, "''");
      await executor.query(`ALTER TYPE "${safeType}" ADD VALUE IF NOT EXISTS '${safeLabel}'`);
    }
  }
}
