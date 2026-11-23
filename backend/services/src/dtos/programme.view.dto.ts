import { Sector } from "../enums/sector.enum";
import { DocumentDto } from "./document.dto";

export class ProgrammeViewDto {

  programmeId: string;

  actionId: string;

  type: string;

  title: string;

  description: string;

  objectives: string;

  instrumentType: string[];

  sector: Sector;

  affectedSubSector: string[];

  programmeStatus: string;

  recipientEntity: string[];

  startYear: number;

  interNationalImplementor: string[];

  nationalImplementor: string[];

  documents: DocumentDto[];

  comments: string;

	validated: boolean;

	achievedGHGReduction?: number;

	expectedGHGReduction?: number;

	ghgsAffected?: string[]

  estimatedAmount: number

  receivedAmount: number
}