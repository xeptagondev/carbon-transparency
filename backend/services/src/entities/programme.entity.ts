import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { SubSector } from "../enums/shared.enum";
import { Sector } from "../enums/sector.enum";
import { NatImplementor } from "../enums/shared.enum";
import { ActionEntity } from "./action.entity";
import { ProjectEntity } from "./project.entity";

@Entity("programme")
export class ProgrammeEntity {
  @PrimaryColumn()
  programmeId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  objective: string;

  @Column({ type: "enum", enum: Sector })
  affectedSectors: Sector[];

  @Column({ type: "enum", enum: SubSector })
  affectedSubSector: SubSector[];

  @Column()
  startYear: number;

  @Column({ type: "enum", enum: NatImplementor })
  natImplementor: NatImplementor[];

  @Column({nullable: false, type: 'double precision' })
  investment: number;

  @Column({ type: 'jsonb', nullable: true })
  documents: any;

  @Column()
  comments: string;

  @Column({ type: "ltree" })
  path: string;

  @ManyToOne(() => ActionEntity, (action) => action.programmes, {
    nullable: true,
  })
  @JoinColumn([{ name: "actionId", referencedColumnName: "actionId" }])
  action: ActionEntity;

  @OneToMany(() => ProjectEntity, (projectEntity) => projectEntity.programme)
  projects?: ProjectEntity[];
}