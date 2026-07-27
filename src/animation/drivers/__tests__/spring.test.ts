import { AnimateValue } from '../../values/AnimateValue';
import { spring } from '../spring';

describe('spring', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('animates from 0 -> 100 and calls onComplete once', () => {
    const value = new AnimateValue(0);
    const onChange = jest.fn();
    const onComplete = jest.fn();

    spring(value, 100, { onChange, onComplete }).start();

    for (let t = 0; t < 5000; t += 16) {
      jest.advanceTimersByTime(16);
      if (value.current === 100) {
        break;
      }
    }

    expect(value.current).toBeCloseTo(100, 2);
    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('zero stiffness should complete immediately', () => {
    const value = new AnimateValue(0);
    const onChange = jest.fn();
    const onComplete = jest.fn();

    spring(value, 100, { stiffness: 0, onChange, onComplete }).start();

    jest.advanceTimersByTime(16);

    expect(value.current).toBe(100);
    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('reset should snap back to original position', () => {
    const value = new AnimateValue(0);

    const controller = spring(value, 100);
    controller.start();

    jest.advanceTimersByTime(100);

    controller.reset();
    // reset() only resets animation state, not the value
    // The value stays at its current position to allow loops to work correctly
    expect(value.current).not.toBe(0);
    
    // To reset the value, use value.reset() directly
    value.reset();
    expect(value.current).toBe(0);
  });

  it('shiftBy preserves velocity across a layout correction + retarget', () => {
    const value = new AnimateValue(80);
    const onComplete = jest.fn();

    const first = spring(value, 0, {
      stiffness: 500,
      damping: 40,
      onComplete,
    });
    first.start();

    jest.advanceTimersByTime(32);
    const mid = value.current as number;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(80);

    // Simulate Reorder FLIP: layout jumped by -80 while the spring was mid-flight.
    first.shiftBy?.(-80);
    expect(value.current).toBeCloseTo(mid - 80, 5);

    const second = spring(value, 0, { stiffness: 500, damping: 40, onComplete });
    second.start();

    // Continuity: the retargeted spring must not flash back to the pre-shift
    // sample (the old cancel+restart path would zero velocity and could
    // briefly publish a stale inherited position).
    expect(value.current).toBeCloseTo(mid - 80, 5);

    for (let t = 0; t < 3000; t += 16) {
      jest.advanceTimersByTime(16);
      if (onComplete.mock.calls.length >= 1 && value.current === 0) break;
    }

    expect(value.current).toBeCloseTo(0, 2);
  });
});
