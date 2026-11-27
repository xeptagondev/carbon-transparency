/**
 * The client's master data leaves some mandatory fields empty. Instead of inventing a value, the
 * user picks "Information not available" so that everyone can see what still needs real information.
 *
 * - Fixed lists (status, type of instrument) and the national strategy list carry it as a value.
 * - Year fields: the dropdown offers it as a first choice; it is saved as an empty year (null) and
 *   the text is shown wherever the year is shown.
 */
export const INFORMATION_NOT_AVAILABLE = 'Information not available';

/** True when a year is empty or is the "Information not available" choice. */
export const isYearNotAvailable = (year: unknown): boolean =>
  year === null || year === undefined || year === '' || year === INFORMATION_NOT_AVAILABLE;

/** A saved year as the dropdown value: an empty year is the "Information not available" choice. */
export const yearToFormValue = (year: number | null | undefined) =>
  year === null || year === undefined ? INFORMATION_NOT_AVAILABLE : year;

/** The year to send to the server: the "Information not available" choice is sent as null. */
export const yearToPayload = (year: unknown): number | null =>
  isYearNotAvailable(year) ? null : Number(year);

/** What a table cell or a read-only field shows for a year. */
export const yearText = (year: unknown) =>
  isYearNotAvailable(year) ? INFORMATION_NOT_AVAILABLE : year;

/**
 * On a multiple-choice field "Information not available" stands alone: choosing it clears the other
 * choices, and choosing any other value clears it.
 */
export const keepInformationNotAvailableExclusive = (
  newValues: string[] | undefined,
  previousValues: string[] | undefined
): string[] => {
  const values = newValues ?? [];
  if (!values.includes(INFORMATION_NOT_AVAILABLE) || values.length === 1) {
    return values;
  }
  const wasSelected = (previousValues ?? []).includes(INFORMATION_NOT_AVAILABLE);
  return wasSelected
    ? values.filter((value) => value !== INFORMATION_NOT_AVAILABLE)
    : [INFORMATION_NOT_AVAILABLE];
};
