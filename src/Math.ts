// Linear Interpolation
export function mix(perc: number, val1: number, val2: number) {
  return val1 * (1 - perc) + val2 * perc;
}

// For clamping values
export function clamp(value: number, lowerbound: number, upperbound: number) {
  return Math.min(Math.max(value, lowerbound), upperbound);
}

function rubber2(distanceFromEdge: number, constant: number) {
  return Math.pow(distanceFromEdge, constant * 5);
}

function rubber(distanceFromEdge: number, dimension: number, constant: number) {
  if (dimension === 0 || Math.abs(dimension) === Infinity)
    return rubber2(distanceFromEdge, constant);
  return (
    (distanceFromEdge * dimension * constant) /
    (dimension + constant * distanceFromEdge)
  );
}

// Rubber clamping
export function rubberClamp(
  value: number,
  lowerbound: number,
  upperbound: number,
  constant: number = 0.15
) {
  if (constant === 0) return clamp(value, lowerbound, upperbound);

  if (value < lowerbound) {
    return (
      -rubber(lowerbound - value, upperbound - lowerbound, constant) +
      lowerbound
    );
  }

  if (value > upperbound) {
    return (
      +rubber(value - upperbound, upperbound - lowerbound, constant) +
      upperbound
    );
  }

  return value;
}
