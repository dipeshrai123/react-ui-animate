/**
 * Function to convert camel case to dashed case
 * eg: backgroundColor -> background-color
 *
 * @param str
 */
export function camelToDash(str: string) {
  if (str != str.toLowerCase()) {
    str = str.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
  }
  return str;
}
