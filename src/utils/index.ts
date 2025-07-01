export function bin(bool: boolean) {
  return bool ? 1 : 0;
}

export function mix(perc: number, val1: number, val2: number) {
  return val1 * (1 - perc) + val2 * perc;
}

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
