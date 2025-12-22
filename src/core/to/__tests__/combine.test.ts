import { MotionValue } from '../../MotionValue';
import { combine } from '../../to/combine';

describe('combine()', () => {
  it('computes an initial combined value from two inputs', () => {
    const a = new MotionValue(1);
    const b = new MotionValue(2);
    const sum = combine([a, b], (x, y) => x + y);

    expect(sum.current).toBe(3);
  });

  it('updates whenever any input changes', () => {
    const a = new MotionValue(1);
    const b = new MotionValue(2);
    const sum = combine([a, b], (x, y) => x + y);

    const values: number[] = [];
    sum.subscribe((v) => values.push(v));

    expect(values).toEqual([3]);

    a.set(3);
    expect(sum.current).toBe(5);
    expect(values).toContain(5);

    b.set(5);
    expect(sum.current).toBe(8);
    expect(values).toContain(8);
  });

  it('works with non-numeric types (e.g. strings)', () => {
    const hello = new MotionValue('Hello, ');
    const world = new MotionValue('World!');
    const greeting = combine([hello, world], (x, y) => x + y);

    expect(greeting.current).toBe('Hello, World!');

    hello.set('Hi, ');
    expect(greeting.current).toBe('Hi, World!');
  });

  it('supports three (or more) inputs', () => {
    const x = new MotionValue(2);
    const y = new MotionValue(3);
    const z = new MotionValue(4);
    const product = combine([x, y, z], (a, b, c) => a * b * c);

    expect(product.current).toBe(24);

    y.set(5);
    expect(product.current).toBe(2 * 5 * 4);
  });
});
