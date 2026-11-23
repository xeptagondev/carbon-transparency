import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	Max,
	MaxLength,
	Min,
	ValidateIf,
	ValidateNested,
} from "class-validator";
import { FinanceNature, FinancingStatus, SupportDirection } from "../enums/support.enum";
import { IsTwoDecimalPoints } from "../util/twoDecimalPointNumber.decorator";
import { IsReferenceValue } from "../util/referenceValue.decorator";
import { ReferenceDataList } from "../enums/reference.data.enum";
import { DocumentDto } from "./document.dto";

/** One year of the national budget allocation, in the domestic currency. */
export class NationalBudgetYearDto {
	@IsInt()
	@Min(1900)
	@Max(2200)
	@ApiProperty()
	year: number;

	@IsNumber()
	@Min(0)
	@IsTwoDecimalPoints()
	@ApiProperty()
	amount: number;
}

export class SupportDto {

	supportId: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	activityId: string;

	@IsNotEmpty()
	@IsEnum(SupportDirection, {
		each: true,
		message: 'Invalid Support Direction. Supported following directions:' + Object.values(SupportDirection)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(SupportDirection),
	})
	direction: SupportDirection;

	@IsNotEmpty()
	@IsEnum(FinanceNature, {
		each: true,
		message: 'Invalid Finance Type. Supported following types:' + Object.values(FinanceNature)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(FinanceNature),
	})
	financeNature: FinanceNature;

	@ValidateIf((c) => c.financeNature == FinanceNature.INTERNATIONAL)
	@IsNotEmpty()
	@IsReferenceValue(ReferenceDataList.CHANNEL_OF_SUPPORT, { each: true })
	@ApiPropertyOptional({
		type: [String]
	})
	internationalSupportChannel: string;

	@ValidateIf((c) => c.financeNature == FinanceNature.INTERNATIONAL)
	@IsNotEmpty()
	@IsReferenceValue(ReferenceDataList.INTERNATIONAL_FINANCIAL_INSTRUMENT, { each: true })
	@ApiPropertyOptional({
		type: [String]
	})
	internationalFinancialInstrument: string;

	@ValidateIf((c) => c.financeNature == FinanceNature.NATIONAL)
	@IsNotEmpty()
	@IsReferenceValue(ReferenceDataList.NATIONAL_FINANCIAL_INSTRUMENT, { each: true })
	@ApiPropertyOptional({
		type: [String]
	})
	nationalFinancialInstrument: string;

	@ValidateIf((c) => c.direction == SupportDirection.RECEIVED)
	@IsNotEmpty()
	@IsEnum(FinancingStatus, {
		each: true,
		message: 'Invalid Financing Status. Supported following:' + Object.values(FinancingStatus)
	})
	@ApiPropertyOptional({
		type: [String],
		enum: Object.values(FinancingStatus),
	})
	financingStatus: FinancingStatus;

	@ValidateIf((c) => c.direction == SupportDirection.NEEDED)
	@IsNotEmpty()
	@IsReferenceValue(ReferenceDataList.PIPELINE_STATUS)
	@ApiPropertyOptional()
	pipelineStatus: string;

	@ValidateIf((c) => c.internationalSource && c.financeNature == FinanceNature.INTERNATIONAL)
	@IsArray()
	@ArrayMinSize(1)
	@MaxLength(500, { each: true })
	@IsNotEmpty({ each: true })
	@IsReferenceValue(ReferenceDataList.INTERNATIONAL_SOURCE, { each: true })
	@ApiProperty({
		type: [String]
	})
	internationalSource: string[];

	@ValidateIf((c) => c.financeNature == FinanceNature.NATIONAL)
	@IsNotEmpty()
	@IsBoolean()
	@ApiPropertyOptional()
	nationallyBudgetSupported: boolean;

	@ValidateIf((c) => c.financeNature == FinanceNature.NATIONAL && c.nationallyBudgetSupported === true)
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => NationalBudgetYearDto)
	@ApiPropertyOptional({
		type: [NationalBudgetYearDto],
		description: "National budget by year in the domestic currency, one entry per year of the activity",
	})
	nationalBudgetAllocation: NationalBudgetYearDto[];

	@ValidateIf((c) => c.direction == SupportDirection.NEEDED)
	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@ApiPropertyOptional()
	@IsTwoDecimalPoints()
	requiredAmount: number;

	@ValidateIf((c) => c.direction == SupportDirection.RECEIVED)
	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@ApiPropertyOptional()
	@IsTwoDecimalPoints()
	receivedAmount: number;

	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	@ApiProperty()
	exchangeRate: number;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	@ApiPropertyOptional()
	comments: string;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => DocumentDto)
	@ApiPropertyOptional({
		type: "array",
		example: [{ title: "Funding agreement", data: "base64 document string" }],
	})
	documents: DocumentDto[];

}
