import { delay } from '../../drivers/delay';
import type { AnimationController } from '../../drivers/AnimationController';

describe('delay driver', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls onComplete after the specified delay', () => {
    const ctrl = delay(100) as AnimationController & {
      setOnComplete(fn: () => void): void;
    };
    const onComplete = jest.fn();
    ctrl.setOnComplete(onComplete);

    ctrl.start();
    jest.advanceTimersByTime(99);
    expect(onComplete).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cancel() prevents onComplete from firing', () => {
    const ctrl = delay(50) as AnimationController & {
      setOnComplete(fn: () => void): void;
    };
    const onComplete = jest.fn();
    ctrl.setOnComplete(onComplete);

    ctrl.start();
    ctrl.cancel();

    jest.advanceTimersByTime(100);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('reset() is an alias for cancel()', () => {
    const ctrl = delay(75) as AnimationController & {
      setOnComplete(fn: () => void): void;
    };
    const onComplete = jest.fn();
    ctrl.setOnComplete(onComplete);

    ctrl.start();
    ctrl.reset();

    jest.advanceTimersByTime(100);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
