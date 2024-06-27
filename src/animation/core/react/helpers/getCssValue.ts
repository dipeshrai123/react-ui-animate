import { unitlessStyleProps } from "../Tags";

/**
 * getCssValue() function to get css value with unit or without unit
 * it is only for style property - it cannot be used with transform keys
 * @param property - style property
 * @param value - style value
 * @returns - value with unit or without unit
 */
export function getCssValue(property: string, value: number | string) {
  let cssValue;
  if (typeof value === "number") {
    if (unitlessStyleProps.indexOf(property) !== -1) {
      cssValue = value;
    } else {
      cssValue = value + "px";
    }
  } else {
    cssValue = value;
  }

  return cssValue;
}
