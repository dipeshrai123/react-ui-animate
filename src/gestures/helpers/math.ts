/**
 * bin(booleanValue)
 * returns 1 if booleanValue == true and 0 if booleanValue == false
 */
export function bin(bool: boolean) {
  return bool ? 1 : 0;
}

/**
 * mix(progress, a, b)
 * linear interpolation between a and b
 */
export function mix(perc: number, val1: number, val2: number) {
  return val1 * (1 - perc) + val2 * perc;
}

/**
 * clamp(value, min, max)
 * clamps value for min and max bounds
 */
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

/**
 * rubberClamp(value, min, max, constant?)
 * constant is optional : default 0.15
 * clamps the value for min and max value and
 * extends beyond min and max values with constant
 * factor to create elastic rubber band effect
 */
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

/**
 * snapTo(value, velocity, snapPoints[])
 * Calculates the final snapPoint according to given current value,
 * velocity and snapPoints array
 */
export function snapTo(
  value: number,
  velocity: number,
  snapPoints: Array<number>
): number {
  const finalValue = value + velocity * 0.2;
  const getDiff = (point: number) => Math.abs(point - finalValue);
  const deltas = snapPoints.map(getDiff);
  const minDelta = Math.min(...deltas);

  return snapPoints.reduce(function (acc, point) {
    if (getDiff(point) === minDelta) {
      return point;
    } else {
      return acc;
    }
  });
}

/**
 * move(array, moveIndex, toIndex)
 * move array item from moveIndex to toIndex without array modification
 */
export function move(array: Array<any>, moveIndex: number, toIndex: number) {
  const item = array[moveIndex];
  const length = array.length;
  const diff = moveIndex - toIndex;

  if (diff > 0) {
    return [
      ...array.slice(0, toIndex),
      item,
      ...array.slice(toIndex, moveIndex),
      ...array.slice(moveIndex + 1, length),
    ];
  } else if (diff < 0) {
    const targetIndex = toIndex + 1;
    return [
      ...array.slice(0, moveIndex),
      ...array.slice(moveIndex + 1, targetIndex),
      item,
      ...array.slice(targetIndex, length),
    ];
  }
  return array;
}
