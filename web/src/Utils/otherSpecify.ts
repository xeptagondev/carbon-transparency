/**
 * Several admin-managed lists end with an "Other" / "Others" value. When it is chosen, the user says
 * what it is in a text box that is saved next to the list value.
 *
 * The value is recognised by its code, which never changes, and not by its label, which an
 * administrator may rename.
 */
export const OTHER_CODES = ['Other', 'Others'];

export const OTHER_TEXT_MAX_LENGTH = 250;

/** True when the value (a single list value or an array of them) contains the Other value. */
export const isOtherSelected = (value: unknown): boolean => {
  const values = Array.isArray(value) ? value : [value];
  return values.some((v) => typeof v === 'string' && OTHER_CODES.includes(v));
};
