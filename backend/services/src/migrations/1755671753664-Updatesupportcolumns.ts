import { MigrationInterface, QueryRunner } from "typeorm";
import { IntFinInstrument } from "../enums/support.enum";
import { NatFinInstrument } from "../enums/support.enum";

export class Updatesupportcolumns1755671753664 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const newInternationalValues = Object.values(IntFinInstrument);
    const newNationalValues = Object.values(NatFinInstrument);

    // 1️⃣ Drop dependent views
    await queryRunner.query(`DROP VIEW IF EXISTS "annex_three_view";`);

    // 2️⃣ Clean invalid values in columns
    await queryRunner.query(`
      UPDATE "public"."support"
      SET "internationalFinancialInstrument" = NULL
      WHERE "internationalFinancialInstrument"::text NOT IN (${newInternationalValues.map(v => `'${v}'`).join(", ")});
    `);
    await queryRunner.query(`
      UPDATE "public"."support"
      SET "nationalFinancialInstrument" = NULL
      WHERE "nationalFinancialInstrument"::text NOT IN (${newNationalValues.map(v => `'${v}'`).join(", ")});
    `);

    // 3️⃣ Replace international enum
    await queryRunner.query(`ALTER TYPE "support_internationalfinancialinstrument_enum" RENAME TO "support_internationalfinancialinstrument_enum_old";`);
    await queryRunner.query(`
      CREATE TYPE "support_internationalfinancialinstrument_enum" AS ENUM (${newInternationalValues.map(v => `'${v}'`).join(", ")});
    `);
    await queryRunner.query(`
      ALTER TABLE "public"."support"
      ALTER COLUMN "internationalFinancialInstrument"
      TYPE "support_internationalfinancialinstrument_enum"
      USING "internationalFinancialInstrument"::text::"support_internationalfinancialinstrument_enum";
    `);
    await queryRunner.query(`DROP TYPE "support_internationalfinancialinstrument_enum_old";`);

    // 4️⃣ Replace national enum
    await queryRunner.query(`ALTER TYPE "support_nationalfinancialinstrument_enum" RENAME TO "support_nationalfinancialinstrument_enum_old";`);
    await queryRunner.query(`
      CREATE TYPE "support_nationalfinancialinstrument_enum" AS ENUM (${newNationalValues.map(v => `'${v}'`).join(", ")});
    `);
    await queryRunner.query(`
      ALTER TABLE "public"."support"
      ALTER COLUMN "nationalFinancialInstrument"
      TYPE "support_nationalfinancialinstrument_enum"
      USING "nationalFinancialInstrument"::text::"support_nationalfinancialinstrument_enum";
    `);
    await queryRunner.query(`DROP TYPE "support_nationalfinancialinstrument_enum_old";`);

    // 5️⃣ Recreate dependent views
    await queryRunner.query(`
      CREATE VIEW "annex_three_view" AS
      SELECT * FROM "public"."support"; -- <-- replace with actual view definition
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Optionally, reverse everything
    // You would drop and recreate views and revert enums if needed
  }
}
