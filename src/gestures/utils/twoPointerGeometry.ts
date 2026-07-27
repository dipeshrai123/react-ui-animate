export interface Point {
  x: number;
  y: number;
}

export function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function angleBetween(a: Point, b: Point): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

export function centerOf(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function pointerPair(
  pointers: ReadonlyMap<number, Point>
): [Point, Point] | null {
  if (pointers.size < 2) return null;
  const ids = [...pointers.keys()].sort((a, b) => a - b);
  return [pointers.get(ids[0])!, pointers.get(ids[1])!];
}
