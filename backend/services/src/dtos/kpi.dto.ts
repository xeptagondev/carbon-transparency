import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { EntityType } from "../enums/shared.enum";
import { IsTwoDecimalPoints } from "../util/twoDecimalPointNumber.decorator";
import { IsReferenceValue } from "../util/referenceValue.decorator";
import { ReferenceDataList } from "../enums/reference.data.enum";

export class KpiDto {
    @IsNotEmpty()
    @IsString()
    @IsReferenceValue(ReferenceDataList.KPI_NAME)
    @ApiProperty()
    name: string;

		@IsNotEmpty()
    @ApiProperty()
    @IsString()
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