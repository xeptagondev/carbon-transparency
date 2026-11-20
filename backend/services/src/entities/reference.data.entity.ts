import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EntitySubject } from "./entity.subject";

/**
 * One selectable value of an admin-managed list ("National configurations").
 *
 * `code` is the stable key that records store; it never changes after creation.
 * `label` is what users see and can be renamed. `isActive = false` hides the value
 * from new selections while records that already use it keep resolving it.
 */
@Entity("reference_data")
@Index("IDX_reference_data_list_code", ["listKey", "code"], { unique: true })
export class ReferenceDataEntity implements EntitySubject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  listKey: string;

  @Column({ type: "varchar", nullable: false })
  code: string;

  @Column({ type: "varchar", nullable: false })
  label: string;

  @Column({ type: "boolean", nullable: false, default: true })
  isActive: boolean;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdTime: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedTime: Date;
}
