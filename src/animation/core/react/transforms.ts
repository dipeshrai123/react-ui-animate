const styleTrasformKeys = [
  'translate',
  'translateX',
  'translateY',
  'translateZ',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'skew',
  'skewX',
  'skewY',
];

function splitCSSValueAndUnit(value: string) {
  const valueMatch = value.match(/(-)?(\d+.)?\d+/g);
  const unitMatch = value.match(
    /px|rem|em|ex|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax/
  );

  return {
    value: Number(valueMatch),
    unit: unitMatch && unitMatch[0],
  };
}

// get unit of transform style property
function getValueUnit(property: string, value: string) {
  let unit;

  const splitValue = splitCSSValueAndUnit(String(value)).value;
  const splitUnit = splitCSSValueAndUnit(String(value)).unit;

  // if string value is passed with unit then split it
  if (splitUnit) {
    return { value: splitValue, unit: splitUnit };
  }

  if (property.includes('translate') || property.includes('perspective')) {
    unit = 'px';
  } else if (property.includes('scale')) {
    unit = '';
  } else if (property.includes('rotate') || property.includes('skew')) {
    unit = 'deg';
  }

  return { value, unit };
}

function getTransformValueWithUnits(property: string, value: string) {
  const valueUnit = getValueUnit(property, value);

  if (
    property.includes('X') ||
    property.includes('Y') ||
    property.includes('Z') ||
    property.includes('perspective') ||
    property.includes('rotate') ||
    property.includes('skew')
  ) {
    // axis value
    return `${property}(${valueUnit.value}${valueUnit.unit})`;
  } else if (property.includes('translate') || property.indexOf('scale')) {
    // two parameter value
    return `${property}(${valueUnit.value}${valueUnit.unit}, ${valueUnit.value}${valueUnit.unit})`;
  } else {
    throw new Error(`Error! Property '${property}' cannot be transformed`);
  }
}

/**
 * getTransform function returns transform string from style object
 */
export function getTransform(style: Record<string, any>) {
  return Object.entries(style)
    .map(([prop, value]) => getTransformValueWithUnits(prop, value))
    .reduce(
      (transform: string, value: string) => (transform += ` ${value}`),
      ''
    )
    .trim();
}

export function isTransformKey(key: string) {
  return styleTrasformKeys.includes(key);
}
