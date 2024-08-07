import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { EntityType } from "../enums/shared.enum";
import { KpiUnits } from "../enums/kpi.enum";
import { IsTwoDecimalPoints } from "../util/twoDecimalPointNumber.decorator";

export class KpiDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    name: string;

		@IsNotEmpty()
    @ApiProperty({ enum: KpiUnits })
    @IsEnum(KpiUnits, {
        message: "Invalid Unit. Supported following creator types:" + Object.values(KpiUnits),
    })
    kpiUnit: string;

    @IsNotEmpty()
    @ApiProperty({ enum: EntityType })
    @IsEnum(EntityType, {
        message: "Invalid creator type. Supported following creator types:" + Object.values(EntityType),
    })
    creatorType: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    creatorId: string;

		@IsTwoDecimalPoints()
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    expected: number;
}