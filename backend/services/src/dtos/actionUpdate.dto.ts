import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, IsOptional, ValidateNested, ValidateIf, IsNumber, Min, Max, ArrayMinSize, MaxLength, IsArray } from "class-validator";
import { IsExclusiveInformationNotAvailable } from "../util/informationNotAvailable";
import { ActionStatus, ActionType, ConSDGs, InstrumentType } from "../enums/action.enum";
import { DocumentDto } from "./document.dto";
import { KpiUpdateDto } from "./kpi.update.dto";
import { Sector } from "../enums/sector.enum";
import { KPIAction } from "../enums/shared.enum";
import { IsReferenceValue } from "../util/referenceValue.decorator";
import { OtherSpecify } from "../util/otherSpecify";
import { ReferenceDataList } from "../enums/reference.data.enum";

export class ActionUpdateDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	actionId: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	title: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	description: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	objective: string;

	@IsNotEmpty()
	@IsEnum(Sector, {
		each: true,
		message: 'Invalid Affected Sector. Supported following types:' + Object.values(Sector)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(Sector),
	})
	sector: Sector;

	@IsNotEmpty()
	@IsEnum(ActionType, {
		each: true,
		message: 'Invalid Action Type:' + Object.values(ActionType)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(ActionType),
	})
	type: ActionType;

	@ArrayMinSize(1)
	@MaxLength(100, { each: true })
	@IsNotEmpty({ each: true })
	@IsExclusiveInformationNotAvailable()
	@IsEnum(InstrumentType, {
		each: true,
		message: "Invalid instrument type. Supported following instrument types:" + Object.values(InstrumentType),
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(InstrumentType),
	})
	instrumentType: InstrumentType[];

	@IsNotEmpty()
	@ApiProperty({ enum: ActionStatus })
	@IsEnum(ActionStatus, {
		message: "Invalid status. Supported following statuses:" + Object.values(ActionStatus),
	})
	status: ActionStatus;

	// null means "Information not available"
	@ValidateIf((o) => o.startYear !== null)
	@IsNotEmpty()
	@IsNumber()
	@Min(2013)
	@Max(2049)
	@ApiProperty({ nullable: true, description: "null means Information not available" })
	startYear: number | null;

	@IsNotEmpty()
	@IsNumber()
	@Min(2013)
	@Max(2049)
	@ApiProperty()
	targetYear: number;

	@IsNotEmpty()
	@IsString()
	@MaxLength(20)
	@IsReferenceValue(ReferenceDataList.NDC_REFERENCE)
	@ApiProperty()
	ndcReference: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(500)
	@IsReferenceValue(ReferenceDataList.INSTITUTION_RESPONSIBLE)
	@ApiProperty()
	institutionResponsible: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	@IsReferenceValue(ReferenceDataList.SUB_SECTOR)
	@ApiPropertyOptional()
	subSector?: string;

	@IsArray()
	@ArrayMinSize(1)
	@MaxLength(500, { each: true })
	@IsNotEmpty({ each: true })
	@IsReferenceValue(ReferenceDataList.POLICY_REFERENCE, { each: true })
	@ApiProperty({
		type: [String],
	})
	policyReference: string[];

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	nsdpReference: string;

	@IsArray()
	@ArrayMinSize(1)
	@IsEnum(ConSDGs, {
		each: true,
		message: "Invalid contribution to SDGs:" + Object.values(ConSDGs),
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(ConSDGs),
	})
	contributionToSdgs: string[];
	@IsArray()
	@ArrayMinSize(1)
	@MaxLength(500, { each: true })
	@IsNotEmpty({ each: true })
	@IsExclusiveInformationNotAvailable()
	@IsReferenceValue(ReferenceDataList.NATIONAL_STRATEGY_ANCHOR, { each: true })
	@ApiProperty({
		type: [String]
	})
	natAnchor: string[];

	@OtherSpecify("natAnchor")
	natAnchorOther?: string;

	@IsOptional()
	@ApiPropertyOptional(
		{
			type: "array",
			example: [{
				title: "document 1",
				data: "base64 document string"
			}],
			items: {
				$ref: getSchemaPath(DocumentDto),
			},
		}
	)
	newDocuments: DocumentDto[];

	@IsOptional()
	@ApiPropertyOptional(
		{
			type: "array",
			example: ["http://test.com/documents/action_documents/testDoc1_1713334127897.csv"],
		}
	)
	removedDocuments: string[];

	@IsOptional()
	@ValidateNested()
	@ApiPropertyOptional(
		{
			type: "array",
			example: [{
				kpiId: "1",
				kpiUnit: "mWp-installed",
				name: "KPI 1",
				creatorType: "action",
				expected: 100,
				KPIAction: KPIAction.CREATED,       // To check KPI is Updated or not for Update Timeline
		}],
			items: {
				$ref: getSchemaPath(KpiUpdateDto),
			},
		}
	)
	kpis: KpiUpdateDto[];

}