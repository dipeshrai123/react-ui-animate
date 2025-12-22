import { AnimateValue, isAnimateValue } from '../AnimateValue';
import type { AnimateController } from '../drivers/AnimateController';

class DummyController implements AnimateController {
  public canceled = false;
  start() {}
  pause() {}
  resume() {}
  cancel() {
    this.canceled = true;
  }
  reset() {}
}

describe('AnimateValue', () => {
  it('exposes initial value via .current and calls subscriber immediately', () => {
    const value = new AnimateValue(10);
    expect(value.current).toBe(10);

    const seen: number[] = [];
    value.subscribe((v) => seen.push(v));
    expect(seen).toEqual([10]);
  });

  it('set(v) updates .current, cancels existing controller, and notifies subscribers', () => {
    const value = new AnimateValue(0);
    const controller1 = new DummyController();
    value.setAnimationController(controller1);
    expect(value.getAnimationController()).toBe(controller1);

    value.set(5);
    expect(controller1.canceled).toBe(true);
    expect(value.current).toBe(5);

    const seen: number[] = [];
    const unsubscribe = value.subscribe((v) => seen.push(v));
    expect(seen).toEqual([5]);

    // setting same value should NOT re-notify
    value.set(5);
    expect(seen).toEqual([5]);

    // setting new value notifies
    value.set(7);
    expect(seen).toEqual([5, 7]);

    unsubscribe();
    value.set(9);
    expect(seen).toEqual([5, 7]); // no further notifications
  });

  it('reset() brings value back to the original initial and notifies', () => {
    const value = new AnimateValue(3);
    const seen: number[] = [];
    value.subscribe((v) => seen.push(v)); // [3]
    value.set(8); // [3,8]
    value.reset(); // [3,8,3]
    expect(value.current).toBe(3);
    expect(seen).toEqual([3, 8, 3]);
  });

  it('destroy() clears subscribers and cancels controller', () => {
    const value = new AnimateValue('foo');
    const seen: string[] = [];
    value.subscribe((v) => seen.push(v)); // [foo]

    const controller = new DummyController();
    value.setAnimationController(controller);

    value.destroy();
    expect(controller.canceled).toBe(true);
    expect(seen).toEqual(['foo']);

    // further set() should still update .current, but no subs to notify
    value.set('bar');
    expect(value.current).toBe('bar');
    expect(seen).toEqual(['foo']);
  });

  describe('to(mapperFn)', () => {
    it('returns a new AnimateValue that maps values through the function', () => {
      const value = new AnimateValue(2);
      const tripled = value.to((v) => v * 3);
      expect(tripled.current).toBe(6);

      const seen: number[] = [];
      tripled.subscribe((v) => seen.push(v)); // [6]

      value.set(4);
      expect(tripled.current).toBe(12);
      expect(seen).toEqual([6, 12]);
    });
  });

  describe('to(inRange, outRange)', () => {
    it('returns a new AnimateValue that interpolates numeric ranges', () => {
      const value = new AnimateValue(0);
      const pct = value.to([0, 1], [0, 100]);
      expect(pct.current).toBe(0);

      value.set(0.5);
      expect(pct.current).toBe(50);

      value.set(1);
      expect(pct.current).toBe(100);
    });
  });
});

describe('isAnimateValue()', () => {
  it('returns true only for AnimateValue instances', () => {
    const value = new AnimateValue(42);
    expect(isAnimateValue(value)).toBe(true);
  });

  it('returns false for any other object—even if it has subscribe()', () => {
    const fake = { subscribe: () => {} };
    expect(isAnimateValue(fake)).toBe(false);
  });

  it('returns false for null and undefined', () => {
    expect(isAnimateValue(null)).toBe(false);
    expect(isAnimateValue(undefined)).toBe(false);
  });

  it('returns false for primitives and objects without subscribe', () => {
    expect(isAnimateValue(0)).toBe(false);
    expect(isAnimateValue('hello')).toBe(false);
    expect(isAnimateValue({})).toBe(false);
    expect(isAnimateValue({ unsubscribe: () => {} })).toBe(false);
  });
});

