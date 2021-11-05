/**
 * style keys which can be accepted by animated component
 */
export const styleTrasformKeys = [
  "perspective",
  "translate",
  "translateX",
  "translateY",
  "translateZ",
  "scale",
  "scaleX",
  "scaleY",
  "scaleZ",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skew",
  "skewX",
  "skewY",
];

// get unit of transform style property
function getUnit(property: string) {
  let unit;
  if (
    property.indexOf("translate") !== -1 ||
    property.indexOf("perspective") !== -1
  ) {
    unit = "px";
  } else if (property.indexOf("scale") !== -1) {
    unit = "";
  } else if (
    property.indexOf("rotate") !== -1 ||
    property.indexOf("skew") !== -1
  ) {
    unit = "deg";
  }

  return unit;
}

function getTransformValueWithUnits(property: string, value: number) {
  const unit = getUnit(property);
  if (
    property.indexOf("X") !== -1 ||
    property.indexOf("Y") !== -1 ||
    property.indexOf("Z") !== -1 ||
    property.indexOf("perspective") !== -1 ||
    property.indexOf("rotate") !== -1 ||
    property.indexOf("skew") !== -1
  ) {
    // axis value
    return `${property}(${value}${unit})`;
  } else if (
    property.indexOf("translate") !== -1 ||
    property.indexOf("scale") !== -1
  ) {
    // two parameter value
    return `${property}(${value}${unit}, ${value}${unit})`;
  } else {
    console.error(
      new Error(`Error! Property ${property} cannot be transformed`)
    );
  }

  return;
}

/**
 * getTransform function returns transform string from style object
 */
export function getTransform(style: any) {
  const styleKeys: any = Object.keys(style);

  return styleKeys
    .map(function (styleProp: string) {
      const value = style[styleProp];

      return getTransformValueWithUnits(styleProp, value);
    })
    .reduce(function (transform: string, value: number) {
      return (transform += ` ${value}`);
    }, "")
    .trim();
}
