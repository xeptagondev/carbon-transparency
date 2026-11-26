import { applyDecorators } from "@nestjs/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, Matches, MaxLength, ValidateIf } from "class-validator";

/**
 * Several admin-managed lists end with an "Other" / "Others" value. When it is chosen, the user says
 * what it is in a text box that is saved next to the list value (for example `natAnchor` and
 * `natAnchorOther`).
 *
 * The value is recognised by its code, which never changes, and not by its label, which an
 * administrator may rename.
 */
export const OTHER_CODES = ["Other", "Others"];

export const OTHER_TEXT_MAX_LENGTH = 250;

export const OTHER_TEXT_MESSAGE = "Please specify the value for Other";

/** True when the value (a single list value or an array of them) contains the Other value. */
export function includesOther(value: unknown): boolean {
  const values = Array.isArray(value) ? value : [value];
  return values.some((v) => typeof v === "string" && OTHER_CODES.includes(v));
}

/**
 * Validation of the text box of an Other value: required (and at most 250 characters) while Other
 * is among the values of `valueKey`, not checked otherwise.
 */
export function OtherSpecify(valueKey: string) {
  return applyDecorators(
    ValidateIf((object: any) => includesOther(object[valueKey])),
    IsString({ message: OTHER_TEXT_MESSAGE }),
    Matches(/\S/, { message: OTHER_TEXT_MESSAGE }),
    MaxLength(OTHER_TEXT_MAX_LENGTH, {
      message: `The text for Other can have at most ${OTHER_TEXT_MAX_LENGTH} characters`,
    }),
    ApiPropertyOptional({
      type: String,
      maxLength: OTHER_TEXT_MAX_LENGTH,
      description: `Required when ${valueKey} contains Other or Others`,
    })
  );
}

/**
 * Keeps the text only while Other is among the values: it is trimmed and saved, and is set to null
 * when the user changed to a normal value. Left alone when the request does not carry the values.
 *
 * On create, a record that has no text and no Other value is left without the property (the column
 * starts as null); on update the text is always set so a change to a normal value clears it.
 */
export function applyOtherText<T extends object>(
  target: T,
  valueKey: keyof T & string,
  textKey: keyof T & string,
  mode: "create" | "update" = "update"
) {
  if (target[valueKey] === undefined) {
    return;
  }
  if (mode === "create" && target[textKey] === undefined && !includesOther(target[valueKey])) {
    return;
  }
  const text = typeof target[textKey] === "string" ? (target[textKey] as string).trim() : "";
  (target as any)[textKey] = includesOther(target[valueKey]) && text.length > 0 ? text : null;
}
