/**
 * Converts a camelCase string to kebab-case.
 * e.g. backgroundColor -> background-color
 *
 * @param str - The camelCase string to convert.
 * @returns The converted kebab-case string.
 */
export function camelCaseToKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, (match) => '-' + match.toLowerCase());
}
