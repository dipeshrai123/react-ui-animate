// check undefined or null
export const isDefined = <T>(value: T): boolean => {
  return value !== undefined && value !== null;
};
