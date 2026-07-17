import { renderHook, act } from '@testing-library/react';
import { animateTo } from '../animateTo';
import { useValue } from '../../hooks/useValue';
import { withTiming, withSpring } from '../../descriptors';

describe('animateTo', () => {
  it('resolves once the descriptor completes, calling the user onComplete first', () => {
    const calls: string[] = [];
    const userOnComplete = jest.fn(() => calls.push('user'));
    let resolved = false;

    const setValue = (to: Parameters<typeof animateTo>[1]) => {
      // Simulate a driver completing synchronously.
      (to.options?.onComplete as () => void)?.();
    };

    animateTo(setValue, {
      type: 'timing',
      to: 100,
      options: { onComplete: userOnComplete },
    }).then(() => {
      resolved = true;
      calls.push('resolved');
    });

    expect(userOnComplete).toHaveBeenCalledTimes(1);
    return Promise.resolve().then(() => {
      expect(resolved).toBe(true);
      expect(calls).toEqual(['user', 'resolved']);
    });
  });

  it('does not require a user onComplete to be present', async () => {
    const setValue = (to: Parameters<typeof animateTo>[1]) => {
      (to.options?.onComplete as () => void)?.();
    };

    await expect(
      animateTo(setValue, { type: 'timing', to: 100 })
    ).resolves.toBeUndefined();
  });

  describe('sequencing across separate AnimateValues via useValue', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('lets two different values animate one after another with async/await', async () => {
      const { result } = renderHook(() => ({
        x: useValue(0),
        y: useValue(0),
      }));
      const [x, setX] = result.current.x;
      const [y, setY] = result.current.y;

      const xDone = animateTo(setX, withTiming(100, { duration: 50 }));
      act(() => {
        jest.advanceTimersByTime(100);
      });
      await xDone;
      expect(x.current).toBeCloseTo(100, 1);
      // y is untouched until x's animation actually resolves.
      expect(y.current).toBe(0);

      const yDone = animateTo(setY, withSpring(50));
      act(() => {
        // Springs only fire onComplete once fully at rest (velocity below
        // threshold), which takes longer than a fixed-duration timing.
        jest.advanceTimersByTime(5000);
      });
      await yDone;
      expect(y.current).toBeCloseTo(50, 1);
    });
  });
});
