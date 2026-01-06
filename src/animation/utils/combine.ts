import { AnimateValue } from '../values/AnimateValue';

/**
 * Combines multiple AnimateValue instances into a single AnimateValue
 * using a combiner function.
 */
export function combine<T extends any[], U>(
  inputs: { [K in keyof T]: AnimateValue<T[K]> },
  combiner: (...values: T) => U
): AnimateValue<U> {
  const initial = inputs.map((value) => value.current) as T;
  const output = new AnimateValue<U>(combiner(...initial));

  const update = () => {
    const values = inputs.map((value) => value.current) as T;
    output.set(combiner(...values));
  };

  inputs.forEach((value) => value.subscribe(() => update()));

  return output;
}

