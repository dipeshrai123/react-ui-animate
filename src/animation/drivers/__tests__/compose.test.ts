import { parallel, sequence, loop, delay } from '../compose';
import type { AnimateController } from '../AnimateController';

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

