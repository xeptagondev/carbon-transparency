import { ActivityStatus, ImpleMeans, Measure } from "../enums/activity.enum";
import { EntityType } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";

export class ActivityResponseDto {

	activityId: string;

	title: string;

	description: string;

	parentType: EntityType;

	parentId: string;

	measure: Measure;

	status: ActivityStatus;

	nationalImplementingEntity: string[]

	nationalImplementingEntityOther: string;

	recipientEntities: string[];

	internationalImplementingEntity: string[]

	internationalImplementingEntityOther: string;

	anchoredInNationalStrategy: boolean;

	meansOfImplementation: ImpleMeans;

	technologyType: string;

	etfDescription: string;

	documents: DocumentDto[];

	achievedGHGReduction: number;

	expectedGHGReduction: number;

	comment: string;

	comments: string;

	startYear: number;

	endYear: number;

	expectedTimeFrame: number;

	gipActivityCode: string;

	gipProjectCode: string;

	gipNppCode: string;

	additionalFundingProposalNo: string;

	projectLocation: string;

	expectedUseImpactsResults: string;

	ggaThematicTargets: string[];

	ggaDimensionalTargets: string[];

	ggaDomains: string[];

	ggaPrioritySystems: string[];

	mitigationInfo: any;

	mitigationTimeline: any;

	migratedData: any;

}