import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ReferenceDataList } from "../enums/reference.data.enum";

export class AddReferenceDataDto {
  @ApiProperty({ enum: ReferenceDataList })
  @IsEnum(ReferenceDataList, {
    message: "Invalid list. Supported lists: " + Object.values(ReferenceDataList),
  })
  listKey: ReferenceDataList;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  label: string;
}

export class RenameReferenceDataDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  label: string;
}

export class SetReferenceDataStatusDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
