import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ArrayMinSize, MaxLength, Min, Max } from 'class-validator';
import { DocumentDto } from "./document.dto";
import { KpiDto } from "./kpi.dto";
import { ProgrammeStatus } from "../enums/programme-status.enum";
import { IsReferenceValue } from "../util/referenceValue.decorator";
import { OtherSpecify } from "../util/otherSpecify";
import { ReferenceDataList } from "../enums/reference.data.enum";

export class ProgrammeDto {

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

    @IsString()
    @ApiPropertyOptional()
    actionId: string;
    
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

    @OtherSpecify("natImplementor")
    natImplementorOther?: string;
  
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
  documents: DocumentDto[];

  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  comments: string;


  @IsOptional()
  @ApiPropertyOptional()
  linkedProjects: string[];

  @IsOptional()
  @ApiPropertyOptional(
    {
      type: "array",
      example: [{
        name: "KPI 1",
        kpiUnit: "mWp-installed",
        creatorType: "programme",
        expected: 100
    }],
      items: {
        $ref: getSchemaPath(KpiDto),
      },
    }
  )
  kpis: KpiDto[];
}