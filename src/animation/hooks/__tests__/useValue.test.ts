import { renderHook, act } from '@testing-library/react';
import { useValue } from '../useValue';
import {
  withTiming,
  withSpring,
  withSequence,
  withLoop,
  withDelay,
  withParallel,
  withCustom,
} from '../../descriptors';
import { AnimateValue } from '../../values/AnimateValue';

describe('useValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('primitive values', () => {
    it('returns AnimateValue for number', () => {
      const { result } = renderHook(() => useValue(0));
      const [value] = result.current;

      expect(value).toBeInstanceOf(AnimateValue);
      expect(value.current).toBe(0);
    });

    it('returns AnimateValue for string', () => {
      const { result } = renderHook(() => useValue('hello'));
      const [value] = result.current;

      expect(value).toBeInstanceOf(AnimateValue);
      expect(value.current).toBe('hello');
    });

    it('sets value directly when given primitive', () => {
      const { result } = renderHook(() => useValue(0));
      const [value, setValue] = result.current;

      act(() => {
        setValue(100);
      });

      expect(value.current).toBe(100);
    });

    it('animates with withTiming', async () => {
      const { result } = renderHook(() => useValue(0));
      const [value, setValue] = result.current;

      act(() => {
        setValue(withTiming(100, { duration: 100 }));
      });

      act(() => {
        jest.advanceTimersByTime(50);
      });

      expect(value.current).toBeGreaterThan(0);
      expect(value.current).toBeLessThan(100);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(value.current).toBeCloseTo(100, 1);
    });

    it('animates with withSpring', async () => {
      const { result } = renderHook(() => useValue(0));
      const [value, setValue] = result.current;

      act(() => {
        setValue(withSpring(100, { stiffness: 200, damping: 20 }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Spring animation should have started
      expect(value.current).toBeGreaterThan(0);
    });

    it('animates with withCustom, driven by the supplied tick fn', async () => {
      const { result } = renderHook(() => useValue(0));
      const [value, setValue] = result.current;

      act(() => {
        setValue(
          withCustom(({ elapsed, from }) => from + elapsed, { duration: 100 })
        );
      });

      act(() => {
        jest.advanceTimersByTime(50);
      });

      expect(value.current).toBeGreaterThan(0);
      expect(value.current).toBeLessThan(100);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(value.current).toBeGreaterThanOrEqual(100);
    });

    it('handles withSequence', async () => {
      const { result } = renderHook(() => useValue(0));
      const [value, setValue] = result.current;

      act(() => {
        setValue(
          withSequence([
            withTiming(50, { duration: 50 }),
            withTiming(100, { duration: 50 }),
          ])
        );
      });

      // Advance time for first animation to complete (50ms)
      act(() => {
        jest.advanceTimersByTime(70);
      });

      expect(value.current).toBeCloseTo(50, 0);

      // Advance time for second animation to complete (another 50ms)
      act(() => {
        jest.advanceTimersByTime(60);
      });

      expect(value.current).toBeCloseTo(100, 1);
    });

    it('handles withLoop, restarting toward the same target every iteration', async () => {
      const { result } = renderHook(() => useValue(0));
      const [value, setValue] = result.current;

      act(() => {
        setValue(withLoop(withTiming(100, { duration: 50 }), 2));
      });

      // Well past both iterations: each restarts toward the same target, so
      // once the loop finishes the value settles at 100.
      act(() => {
        jest.advanceTimersByTime(400);
      });

      expect(value.current).toBeCloseTo(100, 1);
    });

    it.each([
      [1, 100],
      [2, 0],
      [3, 100],
      [4, 0],
    ])(
      'yoyo alternates direction each iteration (%i legs settles at %i)',
      async (iterations, expected) => {
        const { result } = renderHook(() => useValue(0));
        const [value, setValue] = result.current;

        act(() => {
          setValue(
            withLoop(withTiming(100, { duration: 50 }), iterations, { yoyo: true })
          );
        });

        // Well past every leg finishing (a settle-based check avoids relying
        // on hitting an exact frame boundary mid-loop).
        act(() => {
          jest.advanceTimersByTime(400);
        });

        expect(value.current).toBeCloseTo(expected, 1);
      }
    );

    it('snaps to another AnimateValue and keeps following it', () => {
      const { result: source } = renderHook(() => useValue(0));
      const { result: follower } = renderHook(() => useValue(0));
      const [sourceValue, setSourceValue] = source.current;
      const [followerValue, setFollowerValue] = follower.current;

      act(() => {
        setFollowerValue(sourceValue);
      });

      expect(followerValue.current).toBe(0);

      act(() => {
        setSourceValue(42);
      });

      expect(followerValue.current).toBe(42);

      act(() => {
        setSourceValue(7);
      });

      expect(followerValue.current).toBe(7);
    });

    it('follows another AnimateValue with withSpring, retargeting on change', () => {
      const { result: source } = renderHook(() => useValue(0));
      const { result: follower } = renderHook(() => useValue(0));
      const [sourceValue, setSourceValue] = source.current;
      const [followerValue, setFollowerValue] = follower.current;

      act(() => {
        setFollowerValue(withSpring(sourceValue, { stiffness: 200, damping: 20 }));
      });

      act(() => {
        setSourceValue(100);
      });

      act(() => {
        jest.advanceTimersByTime(50);
      });

      expect(followerValue.current).toBeGreaterThan(0);
      expect(followerValue.current).toBeLessThan(100);

      // Retarget mid-flight — value keeps moving, no snap back to 0.
      const midFlight = followerValue.current;

      act(() => {
        setSourceValue(200);
      });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(followerValue.current).toBeGreaterThanOrEqual(midFlight);
    });

    it('provides controls for animation', () => {
      const { result } = renderHook(() => useValue(0));
      const [, setValue, controls] = result.current;

      act(() => {
        setValue(withTiming(100, { duration: 1000 }));
      });

      act(() => {
        controls.pause();
      });

      const pausedValue = result.current[0].current;

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Value should not change when paused
      expect(result.current[0].current).toBe(pausedValue);

      act(() => {
        controls.resume();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Value should change when resumed
      expect(result.current[0].current).not.toBe(pausedValue);
    });

    it('keeps setValue and controls referentially stable across re-renders', () => {
      const { result, rerender } = renderHook(() => useValue(0));
      const [, setValueBefore, controlsBefore] = result.current;

      rerender();

      const [, setValueAfter, controlsAfter] = result.current;

      // A stable identity (like useState's setter) matters here: consumers
      // routinely list it in a useEffect dependency array, and a fresh
      // function on every render would spuriously re-run that effect on
      // every unrelated parent re-render.
      expect(setValueAfter).toBe(setValueBefore);
      expect(controlsAfter).toBe(controlsBefore);
    });
  });

  describe('array values', () => {
    it('returns array of AnimateValues', () => {
      const { result } = renderHook(() => useValue([0, 10, 20]));
      const [value] = result.current;

      expect(Array.isArray(value)).toBe(true);
      expect(value.length).toBe(3);
      expect(value[0]).toBeInstanceOf(AnimateValue);
      expect(value[0].current).toBe(0);
      expect(value[1].current).toBe(10);
      expect(value[2].current).toBe(20);
    });

    it('sets array values directly', () => {
      const { result } = renderHook(() => useValue([0, 0]));
      const [value, setValue] = result.current;

      act(() => {
        setValue([100, 200]);
      });

      expect(value[0].current).toBe(100);
      expect(value[1].current).toBe(200);
    });

    it('animates array values with descriptor', async () => {
      const { result } = renderHook(() => useValue([0, 0]));
      const [value, setValue] = result.current;

      act(() => {
        setValue(withTiming([100, 200], { duration: 100 }));
      });

      // Advance enough time for animation to complete
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(value[0].current).toBeCloseTo(100, 1);
      expect(value[1].current).toBeCloseTo(200, 1);
    });
  });

  describe('object values', () => {
    it('returns object of AnimateValues', () => {
      const { result } = renderHook(() => useValue({ x: 0, y: 10 }));
      const [value] = result.current;

      expect(typeof value).toBe('object');
      expect(value.x).toBeInstanceOf(AnimateValue);
      expect(value.x.current).toBe(0);
      expect(value.y.current).toBe(10);
    });

    it('sets object values directly', () => {
      const { result } = renderHook(() => useValue({ x: 0, y: 0 }));
      const [value, setValue] = result.current;

      act(() => {
        setValue({ x: 100, y: 200 });
      });

      expect(value.x.current).toBe(100);
      expect(value.y.current).toBe(200);
    });

    it('animates object values with descriptor', async () => {
      const { result } = renderHook(() => useValue({ x: 0, y: 0 }));
      const [value, setValue] = result.current;

      act(() => {
        setValue(withTiming({ x: 100, y: 200 }, { duration: 100 }));
      });

      // Advance enough time for animation to complete
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(value.x.current).toBeCloseTo(100, 1);
      expect(value.y.current).toBeCloseTo(200, 1);
    });

    it('handles withSequence for objects', async () => {
      const { result } = renderHook(() => useValue({ x: 0, y: 0 }));
      const [value, setValue] = result.current;

      act(() => {
        setValue(
          withSequence([
            withTiming({ x: 50, y: 50 }, { duration: 50 }),
            withTiming({ x: 100, y: 100 }, { duration: 50 }),
          ])
        );
      });

      // Advance time for first animation to complete (50ms)
      act(() => {
        jest.advanceTimersByTime(70);
      });

      expect(value.x.current).toBeCloseTo(50, 0);
      expect(value.y.current).toBeCloseTo(50, 0);

      // Advance time for second animation to complete (another 50ms)
      act(() => {
        jest.advanceTimersByTime(60);
      });

      expect(value.x.current).toBeCloseTo(100, 1);
      expect(value.y.current).toBeCloseTo(100, 1);
    });

    it('lets withParallel run a different driver per key', async () => {
      const { result } = renderHook(() => useValue({ x: 0, y: 0 }));
      const [value, setValue] = result.current;

      act(() => {
        setValue(
          withParallel({
            x: withTiming(100, { duration: 100 }),
            y: withTiming(50, { duration: 100 }),
          })
        );
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(value.x.current).toBeCloseTo(100, 1);
      expect(value.y.current).toBeCloseTo(50, 1);
    });

    it('only animates keys included in withParallel', async () => {
      const { result } = renderHook(() => useValue({ x: 0, y: 0 }));
      const [value, setValue] = result.current;

      act(() => {
        setValue(withParallel({ x: withTiming(100, { duration: 100 }) }));
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(value.x.current).toBeCloseTo(100, 1);
      expect(value.y.current).toBe(0);
    });
  });

  describe('array values with withParallel', () => {
    it('runs a different driver per index', async () => {
      const { result } = renderHook(() => useValue([0, 0]));
      const [value, setValue] = result.current;

      act(() => {
        setValue(
          withParallel([
            withTiming(100, { duration: 100 }),
            withTiming(50, { duration: 100 }),
          ])
        );
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(value[0].current).toBeCloseTo(100, 1);
      expect(value[1].current).toBeCloseTo(50, 1);
    });
  });
});

