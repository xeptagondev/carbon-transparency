import { MigrationInterface, QueryRunner } from "typeorm";
import { addMissingSectorEnumValues } from "../util/sectorEnum.util";

/**
 * TRAN-257: Extend Postgres sector enums with Vanuatu's 12 additional sectors.
 * Uses ALTER TYPE ... ADD VALUE (no drop/recreate) so existing data and views stay valid.
 * Safe on a fresh DB where sync already created all enum labels (each ADD is skipped).
 *
 * yarn start:dev also applies the same ADD VALUE before synchronize (see TypeOrmConfigService),
 * because TypeORM sync runs before migrations and would otherwise fail on views.
 */
export class AddVanuatuSectors1795600000000 implements MigrationInterface {
  name = "AddVanuatuSectors1795600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await addMissingSectorEnumValues(queryRunner);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Postgres does not support removing enum values without recreating the type.
  }
}