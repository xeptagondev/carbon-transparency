import { MigrationInterface, QueryRunner } from "typeorm";
import { addMissingSectorEnumValues } from "../util/sectorEnum.util";

/**
 * TRAN-257: Extend Postgres sector enums with Vanuatu's 12 additional sectors.
 * Uses ALTER TYPE ... ADD VALUE IF NOT EXISTS (no drop/recreate) so existing data and
 * views stay valid.
 *
 * It runs in the normal migration transaction (Postgres 12 and later allow ADD VALUE inside a
 * transaction; the new values are not used by this migration). Do NOT set `transaction = false` here:
 * the migration runner uses the global transaction mode "all", and TypeORM then refuses to run ANY
 * pending migration (ForbiddenTransactionModeOverrideError).
 *
 * down() is a no-op: Postgres cannot remove enum values without recreating the type,
 * so a rollback leaves the 12 labels in place.
 */
export class AddVanuatuSectors1795600000000 implements MigrationInterface {
  name = "AddVanuatuSectors1795600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await addMissingSectorEnumValues(queryRunner);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Postgres cannot drop individual enum values; rollback does not remove these labels.
  }
}
