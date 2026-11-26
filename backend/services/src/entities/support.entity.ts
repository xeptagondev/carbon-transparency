import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { SupportDirection, FinanceNature, FinancingStatus } from "../enums/support.enum";
import { ActivityEntity } from "./activity.entity";
import { Sector } from "../enums/sector.enum";
import { ActionType } from "../enums/action.enum";

@Entity("support")
export class SupportEntity {
  @PrimaryColumn()
  supportId: string;

  @Column({ type: "enum", enum: SupportDirection })
  direction: string;

  @Column({ type: "enum", enum: FinanceNature })
  financeNature: string;

  @Column({ type: "varchar", nullable: true })
  internationalSupportChannel: string;

  @Column({ type: "varchar", nullable: true })
  internationalFinancialInstrument: string;

  @Column({ type: "varchar", nullable: true })
  nationalFinancialInstrument: string;

  @Column({ type: "enum", enum: FinancingStatus, nullable: true })
  financingStatus: string;

  @Column("varchar", { array: true, nullable: true })
  internationalSource: string[];

  @Column({ nullable: true })
  nationalSource: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  requiredAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  receivedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  exchangeRate: number;

	@Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  requiredAmountDomestic: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  receivedAmountDomestic: number;

  /** Needed support only: how far the funding request has progressed (list "Pipeline status"). */
  @Column({ type: "varchar", nullable: true })
  pipelineStatus: string;

  /** What "Others" means when it is the selected pipeline status. */
  @Column({ type: "varchar", nullable: true })
  pipelineStatusOther: string;

  /** National finance only: whether the national budget contributes to the activity. */
  @Column({ type: "boolean", nullable: true })
  nationallyBudgetSupported: boolean;

  /** National budget by year in the domestic currency: [{ year, amount }], one entry per year of the activity. */
  @Column({ type: "jsonb", nullable: true })
  nationalBudgetAllocation: { year: number; amount: number }[];

  /** Sum of the yearly allocations, in the domestic currency. */
  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  nationalBudgetTotalDomestic: number;

  /** The same total in US dollars (domestic total / exchange rate). */
  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  nationalBudgetTotal: number;

  @Column({ type: "text", nullable: true })
  comments: string;

  @Column({ type: "jsonb", nullable: true })
  documents: any;

  @Column({ nullable: true })
  sector: Sector;

  // @Column({ type: "enum", enum: ActionType,nullable: false })
  // type: string;

  @ManyToOne(() => ActivityEntity, (activity) => activity.support, {
    nullable: false,
		onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: "activityId", referencedColumnName: "activityId" }])
  activity: ActivityEntity;

	@Column({ type: "boolean", default: false })
	validated: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	createdTime: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updatedTime: Date;
}
