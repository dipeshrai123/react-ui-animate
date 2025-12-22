import { isMotionValue } from '../isMotionValue';
import { MotionValue } from '../MotionValue';

describe('isMotionValue()', () => {
  it('returns true only for MotionValue instances', () => {
    const mv = new MotionValue(42);
    expect(isMotionValue(mv)).toBe(true);
  });

  it('returns false for any other object—even if it has subscribe()', () => {
    const fake = { subscribe: () => {} };
    expect(isMotionValue(fake)).toBe(false);
  });

  it('returns false for null and undefined', () => {
    expect(isMotionValue(null)).toBe(false);
    expect(isMotionValue(undefined)).toBe(false);
  });

  it('returns false for primitives and objects without subscribe', () => {
    expect(isMotionValue(0)).toBe(false);
    expect(isMotionValue('hello')).toBe(false);
    expect(isMotionValue({})).toBe(false);
    expect(isMotionValue({ unsubscribe: () => {} })).toBe(false);
  });
});
