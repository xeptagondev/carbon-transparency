import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";
import { FinanceNature, FinancingStatus, SupportDirection } from "../enums/support.enum";
import { IsTwoDecimalPoints } from "../util/twoDecimalPointNumber.decorator";
import { IsReferenceValue } from "../util/referenceValue.decorator";
import { ReferenceDataList } from "../enums/reference.data.enum";

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

	@IsNotEmpty()
	@IsReferenceValue(ReferenceDataList.CHANNEL_OF_SUPPORT, { each: true })
	@ApiProperty({
		type: [String]
	})
	internationalSupportChannel: string;

	@ValidateIf((c) => c.financeNature == FinanceNature.INTERNATIONAL)
	@IsNotEmpty()
	@IsReferenceValue(ReferenceDataList.INTERNATIONAL_FINANCIAL_INSTRUMENT, { each: true })
	@ApiProperty({
		type: [String]
	})
	internationalFinancialInstrument: string;

	@ValidateIf((c) => c.financeNature == FinanceNature.NATIONAL)
	@IsNotEmpty()
	@IsReferenceValue(ReferenceDataList.NATIONAL_FINANCIAL_INSTRUMENT, { each: true })
	@ApiProperty({
		type: [String]
	})
	nationalFinancialInstrument: string;

	@ValidateIf((c) => c.direction == SupportDirection.RECEIVED)
	@IsNotEmpty()
	@IsEnum(FinancingStatus, {
		each: true,
		message: 'Invalid Financing Status. Supported following:' + Object.values(FinancingStatus)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(FinancingStatus),
	})
	financingStatus: FinancingStatus;

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
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@ApiPropertyOptional()
	nationalSource: string;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty()
	@IsTwoDecimalPoints()
	requiredAmount: number;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty()
	@IsTwoDecimalPoints()
  	receivedAmount: number;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty()
  	exchangeRate: number;
	
}