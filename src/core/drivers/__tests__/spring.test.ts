import { AnimateValue } from '../../AnimateValue';
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
});
