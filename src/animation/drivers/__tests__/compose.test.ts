import { parallel, sequence, loop, delay } from '../compose';
import type { AnimateController } from '../AnimateController';
import { setReducedMotion } from '../../utils/reducedMotion';

// A controller that completes synchronously inside start(), the way
// timing/spring/decay do when reduced motion is enabled.
class SyncCompleteController implements AnimateController {
  startedCount = 0;
  private completeCb?: () => void;

  setOnComplete(fn: () => void) {
    this.completeCb = fn;
  }
  start() {
    this.startedCount++;
    this.completeCb?.();
  }
  pause() {}
  resume() {}
  cancel() {}
  reset() {}
}

// Mirrors how timing/spring/decay actually implement setOnComplete — by
// mutating a `hooks.onComplete` field in place — rather than an opaque
// callback field, since that's what a real reused (non-factory) loop
// iteration reads back out via `(controller as any).hooks.onComplete`.
class HooksBasedController implements AnimateController {
  startedCount = 0;
  hooks: { onComplete?: () => void } = {};

  setOnComplete(fn: () => void) {
    this.hooks.onComplete = fn;
  }
  start() {
    this.startedCount++;
  }
  pause() {}
  resume() {}
  cancel() {}
  reset() {}

  complete() {
    this.hooks.onComplete?.();
  }
}

// Shared test helper
class TestController implements AnimateController {
  startedCount = 0;
  pausedCount = 0;
  resumedCount = 0;
  cancelledCount = 0;
  resetCount = 0;
  private completeCb?: () => void;

  setOnComplete(fn: () => void) {
    this.completeCb = fn;
  }
  start() {
    this.startedCount++;
  }
  pause() {
    this.pausedCount++;
  }
  resume() {
    this.resumedCount++;
  }
  cancel() {
    this.cancelledCount++;
  }
  reset() {
    this.resetCount++;
  }

  complete() {
    this.completeCb?.();
  }
}

class ImmediateController implements AnimateController {
  public started = false;
  public paused = false;
  public resumed = false;
  public cancelled = false;
  public resetCalled = false;
  private completeCb?: () => void;

  setOnComplete(fn: () => void) {
    this.completeCb = fn;
  }
  start() {
    this.started = true;
    this.completeCb!();
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.resumed = true;
  }
  cancel() {
    this.cancelled = true;
  }
  reset() {
    this.resetCalled = true;
  }
}

class ManualController implements AnimateController {
  public started = false;
  public paused = false;
  public resumed = false;
  public cancelled = false;
  public resetCalled = false;
  private completeCb?: () => void;

  setOnComplete(fn: () => void) {
    this.completeCb = fn;
  }
  start() {
    this.started = true;
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.resumed = true;
  }
  cancel() {
    this.cancelled = true;
  }
  reset() {
    this.resetCalled = true;
  }

  complete() {
    this.completeCb!();
  }
}

describe('parallel', () => {
  it('calls onStart, starts all controllers, then fires onComplete once when all finish', () => {
    const c1 = new TestController();
    const c2 = new TestController();
    const onStart = jest.fn();
    const onComplete = jest.fn();
    const onAllDone = jest.fn();

    const controller = parallel([c1, c2], { onStart, onComplete });
    controller.setOnComplete?.(onAllDone);

    controller.start();
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(c1.startedCount).toBe(1);
    expect(c2.startedCount).toBe(1);

    c1.complete();
    expect(onComplete).not.toHaveBeenCalled();
    expect(onAllDone).not.toHaveBeenCalled();

    c2.complete();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onAllDone).toHaveBeenCalledTimes(1);
  });

  it('pause() and resume() delegate to all controllers and fire hooks', () => {
    const c1 = new TestController();
    const c2 = new TestController();
    const onPause = jest.fn();
    const onResume = jest.fn();

    const controller = parallel([c1, c2], { onPause, onResume });
    controller.start();

    controller.pause();
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(c1.pausedCount).toBe(1);
    expect(c2.pausedCount).toBe(1);

    controller.resume();
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(c1.resumedCount).toBe(1);
    expect(c2.resumedCount).toBe(1);
  });

  it('cancel() delegates to all controllers and prevents onComplete', () => {
    const c1 = new TestController();
    const c2 = new TestController();
    const onComplete = jest.fn();

    const controller = parallel([c1, c2], { onComplete });
    controller.start();

    controller.cancel();
    expect(c1.cancelledCount).toBe(1);
    expect(c2.cancelledCount).toBe(1);

    c1.complete();
    c2.complete();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('reset() calls reset on each controller but does not start them, and allows restart', () => {
    const c1 = new TestController();
    const c2 = new TestController();

    const controller = parallel([c1, c2]);
    controller.start();

    c1.complete();
    c2.complete();
    expect(c1.resetCount).toBe(0);
    expect(c2.resetCount).toBe(0);

    controller.reset();
    expect(c1.resetCount).toBe(1);
    expect(c2.resetCount).toBe(1);

    expect(c1.startedCount).toBe(1);
    expect(c2.startedCount).toBe(1);

    controller.start();
    expect(c1.startedCount).toBe(2);
    expect(c2.startedCount).toBe(2);
  });
});

describe('sequence', () => {
  it('runs controllers in order and fires onComplete at the end', () => {
    const c1 = new ImmediateController();
    const c2 = new ImmediateController();
    const onStart = jest.fn();
    const onSequenceComplete = jest.fn();

    const seq = sequence([c1, c2], { onStart, onComplete: onSequenceComplete });
    seq.start();

    expect(onStart).toHaveBeenCalledTimes(1);

    expect(c1.started).toBe(true);
    expect(c2.started).toBe(true);

    expect(onSequenceComplete).toHaveBeenCalledTimes(1);
  });

  it('supports setOnComplete callback (onAllDone) and preserves hook order', () => {
    const c = new ImmediateController();
    const calls: string[] = [];
    const seqHook = () => calls.push('hook');
    const allDone = () => calls.push('all');
    const seq = sequence([c], { onComplete: seqHook });
    seq.setOnComplete?.(allDone);
    seq.start();
    expect(calls).toEqual(['all', 'hook']);
  });

  it('pauses, resumes, and cancels the current controller and fires hooks', () => {
    const m = new ManualController();
    const m2 = new ManualController();
    const onPause = jest.fn();
    const onResume = jest.fn();
    const seq = sequence([m, m2], { onPause, onResume });

    seq.start();
    expect(m.started).toBe(true);
    expect(m2.started).toBe(false);

    seq.pause();
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(m.paused).toBe(true);

    seq.resume();
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(m.resumed).toBe(true);

    seq.cancel();
    expect(m.cancelled).toBe(true);
    m.complete();
    expect(m2.started).toBe(false);
  });

  it('reset() calls reset() on all controllers and allows restarting', () => {
    const m1 = new ManualController();
    const m2 = new ManualController();
    const seq = sequence([m1, m2]);

    seq.start();
    m1.complete();
    m2.complete();

    seq.reset();
    expect(m1.resetCalled).toBe(true);
    expect(m2.resetCalled).toBe(true);

    m1.started = false;
    m2.started = false;
    seq.start();
    expect(m1.started).toBe(true);
    expect(m2.started).toBe(false);
  });
});

describe('loop', () => {
  it('runs the driver N times then fires hooks once', () => {
    const driver = new TestController();
    const onStart = jest.fn();
    const onComplete = jest.fn();
    const onAllDone = jest.fn();

    const iterations = 3;
    const controller = loop(driver, iterations, { onStart, onComplete });
    controller.setOnComplete?.(onAllDone);

    controller.start();

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(driver.resetCount).toBe(1);
    expect(driver.startedCount).toBe(1);

    for (let i = 0; i < iterations; i++) {
      driver.complete();
    }

    expect(driver.startedCount).toBe(iterations);

    expect(driver.resetCount).toBe(1 + (iterations - 1));

    expect(onAllDone).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('pause() / resume() delegate to current iteration and fire hooks', () => {
    const driver = new TestController();
    const onPause = jest.fn();
    const onResume = jest.fn();
    const controller = loop(driver, 2, { onPause, onResume });

    controller.start();
    expect(driver.startedCount).toBe(1);

    controller.pause();
    expect(driver.pausedCount).toBe(1);
    expect(onPause).toHaveBeenCalledTimes(1);

    controller.resume();
    expect(driver.resumedCount).toBe(1);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('cancel() stops further iterations and cancels the driver', () => {
    const driver = new TestController();
    const controller = loop(driver, 2);

    controller.start();
    expect(driver.startedCount).toBe(1);

    controller.cancel();
    expect(driver.cancelledCount).toBe(1);

    driver.complete();
    expect(driver.startedCount).toBe(1);
  });

  it('reset() resets the internal count and calls reset() but does not start again', () => {
    const driver = new TestController();
    const controller = loop(driver, 2);

    controller.start();
    expect(driver.resetCount).toBe(1);
    expect(driver.startedCount).toBe(1);
    driver.complete();
    expect(driver.resetCount).toBe(2);
    expect(driver.startedCount).toBe(2);
    driver.complete();
    expect(driver.startedCount).toBe(2);

    const beforeStarted = driver.startedCount;
    controller.reset();
    expect(driver.resetCount).toBe(3);
    expect(driver.startedCount).toBe(beforeStarted);

    controller.start();
    expect(driver.startedCount).toBe(beforeStarted + 1);
  });

  it('accepts a factory, building a fresh controller per iteration', () => {
    const drivers: TestController[] = [];
    const factory = jest.fn(() => {
      const d = new TestController();
      drivers.push(d);
      return d;
    });

    const controller = loop(factory, 3);
    controller.start();

    expect(factory).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledWith(0);
    expect(drivers[0].startedCount).toBe(1);

    drivers[0].complete();
    expect(factory).toHaveBeenCalledTimes(2);
    expect(factory).toHaveBeenCalledWith(1);
    expect(drivers[1]).not.toBe(drivers[0]);

    drivers[1].complete();
    expect(factory).toHaveBeenCalledTimes(3);
    expect(factory).toHaveBeenCalledWith(2);
  });

  it('does not overflow the call stack when every iteration completes synchronously', async () => {
    // Reproduces reduced motion: each driver resolves inside its own
    // start(), so without a re-entrancy guard this recurses on one call
    // stack — enough iterations here to have blown a naive recursive stack.
    const iterations = 50000;
    const controller = loop(() => new SyncCompleteController(), iterations);

    await new Promise<void>((resolve, reject) => {
      controller.setOnComplete?.(resolve);
      try {
        controller.start();
      } catch (err) {
        reject(err);
      }
    });
  });

  it('reusing the same controller across many iterations does not grow an ever-deeper completion chain', () => {
    // Reproduces the real (non-reduced-motion) `withLoop(..., Infinity)`
    // case: one driver instance restarted every iteration, exactly how
    // timing/spring/decay expose completion via a mutable `hooks.onComplete`
    // field. Left running long enough (many iterations), re-reading that
    // field each iteration would wrap the previous iteration's wrapper
    // instead of the true original, eventually overflowing the stack when
    // the whole chain finally unwinds.
    const driver = new HooksBasedController();
    const iterations = 20000;
    const controller = loop(driver, iterations);

    controller.start();
    expect(driver.startedCount).toBe(1);

    expect(() => {
      for (let i = 0; i < iterations - 1; i++) {
        driver.complete();
      }
    }).not.toThrow();

    expect(driver.startedCount).toBe(iterations);
  });

  it('runs only one iteration when reduced motion is enabled, even for Infinity', () => {
    setReducedMotion(true);
    try {
      const drivers: SyncCompleteController[] = [];
      const factory = jest.fn(() => {
        const d = new SyncCompleteController();
        drivers.push(d);
        return d;
      });
      const onComplete = jest.fn();

      loop(factory, Infinity, { onComplete }).start();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
    } finally {
      setReducedMotion(null);
    }
  });
});

describe('delay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls onComplete after the specified delay', () => {
    const controller = delay(100) as AnimateController & {
      setOnComplete(fn: () => void): void;
    };
    const onComplete = jest.fn();
    controller.setOnComplete(onComplete);

    controller.start();
    jest.advanceTimersByTime(99);
    expect(onComplete).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cancel() prevents onComplete from firing', () => {
    const controller = delay(50) as AnimateController & {
      setOnComplete(fn: () => void): void;
    };
    const onComplete = jest.fn();
    controller.setOnComplete(onComplete);

    controller.start();
    controller.cancel();

    jest.advanceTimersByTime(100);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('reset() is an alias for cancel()', () => {
    const controller = delay(75) as AnimateController & {
      setOnComplete(fn: () => void): void;
    };
    const onComplete = jest.fn();
    controller.setOnComplete(onComplete);

    controller.start();
    controller.reset();

    jest.advanceTimersByTime(100);
    expect(onComplete).not.toHaveBeenCalled();
  });
});

