/**
 * Checks if a value is defined (not null or undefined).
 *
 * This utility function helps in determining whether a given value is neither `null` nor `undefined`.
 * It can be useful for validation checks to ensure that a value is properly defined before proceeding
 * with further operations.
 *
 * @param {T} value - The value to check.
 * @returns {boolean} - Returns `true` if the value is neither `null` nor `undefined`, otherwise returns `false`.
 *
 */
export const isDefined = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};
