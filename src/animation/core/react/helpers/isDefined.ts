/**
 * isDefined to check the value is defined or not
 * @param value - any
 * @returns - boolean
 */
export const isDefined = <T>(value: T) => {
  return value !== null && value !== undefined;
};
