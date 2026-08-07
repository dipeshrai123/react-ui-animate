import { AnimateValue } from '../../values/AnimateValue';
import { custom } from '../custom';

describe('custom', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls onStart, ticks via the supplied fn, then onComplete once duration elapses', () => {
    const value = new AnimateValue(0);
    const onStart = jest.fn();
    const onChange = jest.fn();
    const onComplete = jest.fn();

    const tick = jest.fn(({ elapsed, from }) => from + elapsed);

    const controller = custom(value, tick, {
      duration: 100,
      onStart,
      onChange,
      onComplete,
    });

    controller.start();
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(value.getAnimationController()).toBe(controller);

    for (let i = 0; i < 20; i++) {
      jest.advanceTimersByTime(16);
      if (onComplete.mock.calls.length) break;
    }

    expect(tick).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(value.current).toBeGreaterThan(0);
  });

  it('runs indefinitely without a duration until cancel() is called', () => {
    const value = new AnimateValue(0);
    const onComplete = jest.fn();
    const tick = jest.fn(({ elapsed, from }) => from + elapsed);

    const controller = custom(value, tick, { onComplete });
    controller.start();

    jest.advanceTimersByTime(500);
    expect(onComplete).not.toHaveBeenCalled();
    expect(value.current).toBeGreaterThan(0);

    controller.cancel();
    const valueAtCancel = value.current;
    jest.advanceTimersByTime(500);
    expect(value.current).toBe(valueAtCancel);
  });

  it('pause() stops ticking and resume() continues from where it left off', () => {
    const value = new AnimateValue(0);
    const tick = jest.fn(({ elapsed, from }) => from + elapsed);

    const controller = custom(value, tick, { duration: 1000 });
    controller.start();

    jest.advanceTimersByTime(100);
    controller.pause();
    const pausedValue = value.current;

    jest.advanceTimersByTime(500);
    expect(value.current).toBe(pausedValue);

    controller.resume();
    jest.advanceTimersByTime(100);
    expect(value.current).toBeGreaterThan(pausedValue);
  });

  it('uses an explicit `from` instead of the value current when provided', () => {
    const value = new AnimateValue(42);
    const tick = jest.fn(({ from }) => from);

    const controller = custom(value, tick, { from: 7, duration: 10 });
    controller.start();
    jest.advanceTimersByTime(16);

    expect(tick).toHaveBeenCalledWith(
      expect.objectContaining({ from: 7 })
    );
  });
});
