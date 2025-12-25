import { renderHook, act } from '@testing-library/react';
import { useValue } from '../useValue';
import { withTiming, withSpring, withSequence, withLoop, withDelay } from '../../descriptors';
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

    it('handles withLoop', async () => {
      const { result } = renderHook(() => useValue(0));
      const [value, setValue] = result.current;

      act(() => {
        setValue(
          withLoop(withTiming(100, { duration: 50 }), 2)
        );
      });

      // Advance enough time for first iteration to complete
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(value.current).toBeCloseTo(100, 1);

      // Should loop back and complete second iteration
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(value.current).toBeCloseTo(100, 1);
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
  });
});

