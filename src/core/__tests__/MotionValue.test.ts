import { MotionValue } from '../MotionValue';
import type { AnimationController } from '../drivers/AnimationController';

class DummyController implements AnimationController {
  public canceled = false;
  start() {}
  pause() {}
  resume() {}
  cancel() {
    this.canceled = true;
  }
  reset() {}
}

describe('MotionValue', () => {
  it('exposes initial value via .current and calls subscriber immediately', () => {
    const mv = new MotionValue(10);
    expect(mv.current).toBe(10);

    const seen: number[] = [];
    mv.subscribe((v) => seen.push(v));
    expect(seen).toEqual([10]);
  });

  it('set(v) updates .current, cancels existing controller, and notifies subscribers', () => {
    const mv = new MotionValue(0);
    const ctrl1 = new DummyController();
    mv.setAnimationController(ctrl1);
    expect(mv.getAnimationController()).toBe(ctrl1);

    mv.set(5);
    expect(ctrl1.canceled).toBe(true);
    expect(mv.current).toBe(5);

    const seen: number[] = [];
    const unsubscribe = mv.subscribe((v) => seen.push(v));
    expect(seen).toEqual([5]);

    // setting same value should NOT re-notify
    mv.set(5);
    expect(seen).toEqual([5]);

    // setting new value notifies
    mv.set(7);
    expect(seen).toEqual([5, 7]);

    unsubscribe();
    mv.set(9);
    expect(seen).toEqual([5, 7]); // no further notifications
  });

  it('reset() brings value back to the original initial and notifies', () => {
    const mv = new MotionValue(3);
    const seen: number[] = [];
    mv.subscribe((v) => seen.push(v)); // [3]
    mv.set(8); // [3,8]
    mv.reset(); // [3,8,3]
    expect(mv.current).toBe(3);
    expect(seen).toEqual([3, 8, 3]);
  });

  it('destroy() clears subscribers and cancels controller', () => {
    const mv = new MotionValue('foo');
    const seen: string[] = [];
    mv.subscribe((v) => seen.push(v)); // [foo]

    const ctrl = new DummyController();
    mv.setAnimationController(ctrl);

    mv.destroy();
    expect(ctrl.canceled).toBe(true);
    expect(seen).toEqual(['foo']);

    // further set() should still update .current, but no subs to notify
    mv.set('bar');
    expect(mv.current).toBe('bar');
    expect(seen).toEqual(['foo']);
  });

  describe('to(mapperFn)', () => {
    it('returns a new MotionValue that maps values through the function', () => {
      const mv = new MotionValue(2);
      const tripled = mv.to((v) => v * 3);
      expect(tripled.current).toBe(6);

      const seen: number[] = [];
      tripled.subscribe((v) => seen.push(v)); // [6]

      mv.set(4);
      expect(tripled.current).toBe(12);
      expect(seen).toEqual([6, 12]);
    });
  });

  describe('to(inRange, outRange)', () => {
    it('returns a new MotionValue that interpolates numeric ranges', () => {
      const mv = new MotionValue(0);
      const pct = mv.to([0, 1], [0, 100]);
      expect(pct.current).toBe(0);

      mv.set(0.5);
      expect(pct.current).toBe(50);

      mv.set(1);
      expect(pct.current).toBe(100);
    });
  });
});
