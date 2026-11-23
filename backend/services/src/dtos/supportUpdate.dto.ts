import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { DocumentDto } from "./document.dto";
import { SupportDto } from "./support.dto";

/**
 * Same rules as creating a support record. Documents are sent as additions (newDocuments) and
 * removals (removedDocuments, the stored urls) instead of the full list.
 */
export class SupportUpdateDto extends SupportDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	supportId: string;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => DocumentDto)
	@ApiPropertyOptional({
		type: "array",
		example: [{ title: "Funding agreement", data: "base64 document string" }],
	})
	newDocuments?: DocumentDto[];

	@IsOptional()
	@IsArray()
	@ApiPropertyOptional({
		type: "array",
		example: ["http://test.com/documents/support_documents/agreement_1713334127897.pdf"],
	})
	removedDocuments?: string[];
}
