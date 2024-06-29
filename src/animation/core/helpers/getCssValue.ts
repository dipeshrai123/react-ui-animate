const unitlessStyleProps = [
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'fontWeight',
  'lineHeight',
  'opacity',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  // SVG-related properties
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
  // prefixed
  'animationIterationCount',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridRow',
  'gridColumn',
  'order',
  'lineClamp',
];

/**
 * getCssValue() function to get css value with unit or without unit
 * it is only for style property - it cannot be used with transform keys
 * @param property - style property
 * @param value - style value
 * @returns - value with unit or without unit
 */
export function getCssValue(property: string, value: number | string) {
  let cssValue;
  if (typeof value === 'number') {
    if (unitlessStyleProps.includes(property)) {
      cssValue = value;
    } else {
      cssValue = value + 'px';
    }
  } else {
    cssValue = value;
  }

  return cssValue;
}
