import { isReducedMotionEnabled, setReducedMotion } from '../reducedMotion';
import { AnimateValue } from '../../values/AnimateValue';
import { timing } from '../../drivers/timing';
import { spring } from '../../drivers/spring';
import { decay } from '../../drivers/decay';

describe('reducedMotion', () => {
  afterEach(() => {
    setReducedMotion(null);
  });

  it('defaults to following the media query (false in jsdom)', () => {
    expect(isReducedMotionEnabled()).toBe(false);
  });

  it('can be force-enabled and force-disabled via override', () => {
    setReducedMotion(true);
    expect(isReducedMotionEnabled()).toBe(true);

    setReducedMotion(false);
    expect(isReducedMotionEnabled()).toBe(false);

    setReducedMotion(null);
    expect(isReducedMotionEnabled()).toBe(false);
  });

  describe('driver integration', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('timing jumps straight to target when reduced motion is enabled', () => {
      setReducedMotion(true);

      const value = new AnimateValue<number | string>(0);
      const onComplete = jest.fn();

      timing(value, 100, { duration: 1000, onComplete }).start();

      expect(value.current).toBe(100);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('spring jumps straight to target when reduced motion is enabled', () => {
      setReducedMotion(true);

      const value = new AnimateValue<number | string>(0);
      const onComplete = jest.fn();

      spring(value, 100, { onComplete }).start();

      expect(value.current).toBe(100);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('decay settles immediately without moving when reduced motion is enabled', () => {
      setReducedMotion(true);

      const value = new AnimateValue<number>(0);
      const onComplete = jest.fn();

      decay(value, 500, { onComplete }).start();

      expect(value.current).toBe(0);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
