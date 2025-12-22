import { MotionValue } from '../MotionValue';

export function combine<T extends any[], U>(
  inputs: { [K in keyof T]: MotionValue<T[K]> },
  combiner: (...values: T) => U
): MotionValue<U> {
  const initial = inputs.map((fv) => fv.current) as T;
  const out = new MotionValue<U>(combiner(...initial));

  const update = () => {
    const vals = inputs.map((fv) => fv.current) as T;
    out.set(combiner(...vals));
  };

  inputs.map((fv) => fv.subscribe(() => update()));

  return out;
}
