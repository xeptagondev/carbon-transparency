import { actionViewSQL } from "../entities/action.view.entity";
import { activityViewSQL } from "../entities/activity.view.entity";
import { annexThreeReportSQL } from "../entities/annexThree.view.entity";
import { programmeViewSQL } from "../entities/programme.view.entity";
import { projectViewSQL } from "../entities/project.view.entity";
import { reportFiveViewSQL } from "../entities/report.five.view.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * TRAN-260: Action form fields and action_view_entity international implementers.
 */
export class ActionFormUpdates1795800000000 implements MigrationInterface {
  name = "ActionFormUpdates1795800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "action" ADD COLUMN IF NOT EXISTS "targetYear" integer`);
    await queryRunner.query(`ALTER TABLE "action" ADD COLUMN IF NOT EXISTS "ndcReference" character varying`);
    await queryRunner.query(`ALTER TABLE "action" ADD COLUMN IF NOT EXISTS "institutionResponsible" character varying`);
    await queryRunner.query(`ALTER TABLE "action" ADD COLUMN IF NOT EXISTS "subSector" character varying`);
    await queryRunner.query(
      `ALTER TABLE "action" ADD COLUMN IF NOT EXISTS "policyReference" character varying array`
    );
    await queryRunner.query(`ALTER TABLE "action" ADD COLUMN IF NOT EXISTS "nsdpReference" text`);
    await queryRunner.query(
      `ALTER TABLE "action" ADD COLUMN IF NOT EXISTS "contributionToSdgs" character varying array`
    );

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_action_ndcReference"
      ON "action" ("ndcReference")
      WHERE "ndcReference" IS NOT NULL
    `);

    await queryRunner.query(`DROP VIEW IF EXISTS annex_three_view`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS report_five_view_entity`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS action_view_entity`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS programme_view_entity`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS project_view_entity`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS activity_view_entity`);

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

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Action columns retained; view rollback not automated.
  }
}