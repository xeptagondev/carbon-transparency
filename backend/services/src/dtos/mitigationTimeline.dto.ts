import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { GHGS } from "src/enums/shared.enum";

export class mitigationTimelineDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  activityId: string;

  @ApiProperty()
  mitigationTimeline: {
    expected: {
      baselineEmissions: number[];
      activityEmissionsWithM: number[];
      activityEmissionsWithAM: number[];
      expectedEmissionReductWithM: number[];
      expectedEmissionReductWithAM: number[];
      total: {
        baselineEmissions: number;
        activityEmissionsWithM: number;
        activityEmissionsWithAM: number;
        expectedEmissionReductWithM: number;
        expectedEmissionReductWithAM: number;
      };
    };
    actual: {
      baselineActualEmissions: number[];
      activityActualEmissions: number[];
      actualEmissionReduct: number[];
      total: {
        baselineActualEmissions: number;
        activityActualEmissions: number;
        actualEmissionReduct: number;
      };
    };
  };

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  achievedGHGReduction: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  expectedGHGReduction: number;

  @ApiPropertyOptional()
  @IsEnum(GHGS)
  @IsOptional()
  unit?: GHGS;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  startYear?: number;
}
