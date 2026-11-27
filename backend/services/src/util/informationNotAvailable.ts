import { ValidationOptions, registerDecorator } from "class-validator";

/**
 * The client's master data leaves some mandatory fields empty. Instead of inventing a value, the
 * user picks "Information not available" so that everyone can see what still needs real information.
 *
 * - Fixed lists (status, type of instrument) and the national strategy list carry it as a value.
 * - Year fields keep it as an empty year (null) and show this text instead.
 */
export const INFORMATION_NOT_AVAILABLE = "Information not available";

/** The text shown (in lists, views and exports) for a year that is empty. */
export function yearOrNotAvailable<T>(year: T | null | undefined): T | string {
  return year === null || year === undefined || (year as any) === "" ? INFORMATION_NOT_AVAILABLE : year;
}

/** True when a year is empty, that is, "Information not available". */
export function isYearNotAvailable(year: unknown): boolean {
  return year === null || year === undefined || year === "";
}

/**
 * On a multiple-choice field "Information not available" stands alone: it may not be combined with
 * other values.
 */
export function IsExclusiveInformationNotAvailable(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "isExclusiveInformationNotAvailable",
      target: object.constructor,
      propertyName,
      options: {
        message: `"${INFORMATION_NOT_AVAILABLE}" cannot be combined with other values in ${propertyName}`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          return !Array.isArray(value) || !value.includes(INFORMATION_NOT_AVAILABLE) || value.length === 1;
        },
      },
    });
  };
}
