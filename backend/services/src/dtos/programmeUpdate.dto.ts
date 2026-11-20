import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ArrayMinSize, MaxLength, Min, Max, ValidateNested} from 'class-validator';
import { KPIAction } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";
import { ProgrammeStatus } from "../enums/programme-status.enum";
import { KpiUpdateDto } from "./kpi.update.dto";
import { IsReferenceValue } from "../util/referenceValue.decorator";
import { ReferenceDataList } from "../enums/reference.data.enum";

export class ProgrammeUpdateDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    programmeId: string;

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
    
    @IsArray()
    @ArrayMinSize(1)
    @MaxLength(500, { each: true })
    @IsNotEmpty({ each: true })
    @IsReferenceValue(ReferenceDataList.SUB_SECTOR, { each: true })
    @ApiProperty({
      type: [String]
    })
    affectedSubSector: string[];

    @IsNotEmpty()
    @IsNumber()
    @Min(2013)
    @Max(2049)
    @ApiProperty()
    startYear: number;

    @IsArray()
    @ArrayMinSize(1)
    @MaxLength(500, { each: true })
    @IsNotEmpty({ each: true })
    @IsReferenceValue(ReferenceDataList.NATIONAL_IMPLEMENTING_ENTITY, { each: true })
    @ApiProperty({
      type: [String]
    })
    natImplementor: string[];

    // @IsNotEmpty()
    // @IsNumber()
		// @IsTwoDecimalPoints()
    // @ApiProperty()
    // investment: number;

		@IsNotEmpty()
    @IsEnum(ProgrammeStatus, {
			each: true,
			message: 'Invalid Programme Status. Supported following status:' + Object.values(ProgrammeStatus)
    })
    @ApiProperty({
      type: [String],
      enum: Object.values(ProgrammeStatus),
    })
    programmeStatus: number;
  
    @IsOptional()
    @ApiPropertyOptional()
    @IsString()
    comments: string;

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
        example: ["http://test.com/documents/programme_documents/testDoc1_1713334127897.csv"],
      }
    )
    removedDocuments: string[];

    @IsString()
    @ApiPropertyOptional()
    actionId: string;

    @IsOptional()
    @ValidateNested()
    @ApiPropertyOptional(
      {
        type: "array",
        example: [{
          kpiId: "1",
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