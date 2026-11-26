import { MigrationInterface, QueryRunner } from "typeorm";
import { ReferenceDataList } from "../enums/reference.data.enum";

const NEW_TYPE_OF_TECHNOLOGY_LABELS = [
  "Clean Transport",
  "Sustainable Fuels",
  "Water Management",
  "Climate-Smart Agriculture",
];

/**
 * TRAN-258: Ensure Vanuatu technology types exist in reference_data for existing DBs.
 */
export class AddVanuatuTechnologyTypes1795700000000 implements MigrationInterface {
  name = "AddVanuatuTechnologyTypes1795700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "reference_data" ("listKey", "code", "label", "isActive")
       SELECT $1::text, v, v, true FROM unnest($2::text[]) AS v
       ON CONFLICT ("listKey", "code") DO NOTHING`,
      [ReferenceDataList.TYPE_OF_TECHNOLOGY, NEW_TYPE_OF_TECHNOLOGY_LABELS]
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Add-only list: labels remain in reference_data after rollback.
  }
}