const styleTrasformKeys = [
  'perspective',
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

  if (
    property.indexOf('translate') !== -1 ||
    property.indexOf('perspective') !== -1
  ) {
    unit = 'px';
  } else if (property.indexOf('scale') !== -1) {
    unit = '';
  } else if (
    property.indexOf('rotate') !== -1 ||
    property.indexOf('skew') !== -1
  ) {
    unit = 'deg';
  }

  return { value, unit };
}

function getTransformValueWithUnits(property: string, value: string) {
  const valueUnit = getValueUnit(property, value);

  if (
    property.indexOf('X') !== -1 ||
    property.indexOf('Y') !== -1 ||
    property.indexOf('Z') !== -1 ||
    property.indexOf('perspective') !== -1 ||
    property.indexOf('rotate') !== -1 ||
    property.indexOf('skew') !== -1
  ) {
    // axis value
    return `${property}(${valueUnit.value}${valueUnit.unit})`;
  } else if (
    property.indexOf('translate') !== -1 ||
    property.indexOf('scale') !== -1
  ) {
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
