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

	recipientEntities: string[];

	internationalImplementingEntity: string[]

	anchoredInNationalStrategy: boolean;

	meansOfImplementation: ImpleMeans;

	technologyType: string;

	etfDescription: string;

	documents: DocumentDto[];

	achievedGHGReduction: number;

	expectedGHGReduction: number;

	comments: string;

	mitigationInfo: any;

	mitigationTimeline: any;

	migratedData: any;

}